// Production/API server for the Japan Trip Tracker.
//   • Stores the ONE shared trip on disk (server/data/trip.json) so every
//     visitor sees the same activities, gallery, etc.
//   • Photos are uploaded as files into server/data/uploads/ and served at
//     /uploads — the trip JSON only stores their URLs.
//   • Editing is gated by a server-side passcode (EDIT_PASSCODE); a correct
//     passcode returns a bearer token required by all write endpoints.
//   • /api/flight proxies live flight status (key kept server-side).
//   • Also serves the built frontend from ../dist (single-process deploy).
import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultTrip } from '../src/data/trip.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 3001
const RAPIDAPI_HOST = 'aerodatabox.p.rapidapi.com'
const KEY = process.env.AERODATABOX_KEY
const PASSCODE = process.env.EDIT_PASSCODE || ''

// ── Storage ──
const dataDir = path.join(__dirname, 'data')
const uploadsDir = path.join(dataDir, 'uploads')
const tripFile = path.join(dataDir, 'trip.json')
fs.mkdirSync(uploadsDir, { recursive: true })
if (!fs.existsSync(tripFile)) {
  fs.writeFileSync(tripFile, JSON.stringify(defaultTrip, null, 2))
  console.log('Seeded server/data/trip.json with the default trip.')
}

async function readTrip() {
  try {
    return JSON.parse(await fsp.readFile(tripFile, 'utf8'))
  } catch {
    return defaultTrip
  }
}
async function writeTrip(trip) {
  const tmp = tripFile + '.tmp'
  await fsp.writeFile(tmp, JSON.stringify(trip, null, 2))
  await fsp.rename(tmp, tripFile) // atomic replace
}

// Remove uploaded images no longer referenced by the gallery (skip very recent
// files, which may be mid-upload from another session).
async function gcUploads(trip) {
  const used = new Set(
    (trip.gallery || [])
      .filter((g) => g.type === 'image' && typeof g.src === 'string')
      .map((g) => path.basename(g.src)),
  )
  const files = await fsp.readdir(uploadsDir)
  const now = Date.now()
  for (const f of files) {
    if (used.has(f)) continue
    const st = await fsp.stat(path.join(uploadsDir, f)).catch(() => null)
    if (!st || now - st.mtimeMs < 2 * 60 * 1000) continue
    await fsp.unlink(path.join(uploadsDir, f)).catch(() => {})
  }
}

// ── Auth (in-memory session tokens; cleared on restart) ──
const sessions = new Set()
function issueToken() {
  const t = crypto.randomBytes(24).toString('hex')
  sessions.add(t)
  return t
}
function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token && sessions.has(token)) return next()
  res.status(401).json({ error: 'Not authorized — log in first.' })
}

const app = express()
app.use(express.json({ limit: '1mb' }))

app.post('/api/login', (req, res) => {
  if (!PASSCODE) {
    return res
      .status(503)
      .json({ error: 'Editing is disabled: the server has no EDIT_PASSCODE set.' })
  }
  const given = Buffer.from(String((req.body || {}).passcode ?? ''))
  const real = Buffer.from(PASSCODE)
  const ok = given.length === real.length && crypto.timingSafeEqual(given, real)
  if (!ok) return res.status(401).json({ error: 'Wrong passcode.' })
  res.json({ token: issueToken() })
})

// Public read of the shared trip.
app.get('/api/trip', async (_req, res) => {
  res.json(await readTrip())
})

// Authenticated full-trip save.
app.put('/api/trip', requireAuth, async (req, res) => {
  const trip = req.body
  if (!trip || typeof trip !== 'object' || Array.isArray(trip)) {
    return res.status(400).json({ error: 'Invalid trip payload.' })
  }
  await writeTrip(trip)
  gcUploads(trip).catch(() => {})
  res.json(trip)
})

// Authenticated image upload (stored as a file, returns its URL).
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, _file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + '.jpg'),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

// Live flight status proxy.
app.get('/api/flight/:number/:date', async (req, res) => {
  if (!KEY) {
    return res
      .status(503)
      .json({ error: 'Server is missing AERODATABOX_KEY (set it in .env).' })
  }
  const { number, date } = req.params
  try {
    const target =
      `https://${RAPIDAPI_HOST}/flights/number/${encodeURIComponent(number)}/${encodeURIComponent(date)}` +
      '?withAircraftImage=false&withLocation=false'
    const upstream = await fetch(target, {
      headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': RAPIDAPI_HOST },
    })
    const body = await upstream.text()
    res.status(upstream.status).type('application/json').send(body)
  } catch (err) {
    res.status(502).json({ error: 'Upstream request failed: ' + String(err) })
  }
})

// Serve uploaded photos.
app.use('/uploads', express.static(uploadsDir))

// Serve the built frontend + SPA fallback (only if built).
const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res) => res.sendFile(path.join(distDir, 'index.html')))
} else {
  console.warn('⚠️  dist/ not found — run `npm run build` to serve the site.')
}

app.listen(PORT, () => {
  console.log(`Japan Trip Tracker listening on http://127.0.0.1:${PORT}`)
  if (!KEY) console.warn('⚠️  AERODATABOX_KEY not set — the Live flight button returns 503.')
  if (!PASSCODE) console.warn('⚠️  EDIT_PASSCODE not set — editing is disabled until you set one.')
})
