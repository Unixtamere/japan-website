import { useEffect, useRef, useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import * as api from './services/api.js'
import { fileToResizedBlob } from './utils/image.js'
import { fetchFlightStatus } from './services/flightApi.js'
import Petals from './components/Petals.jsx'
import Header from './components/Header.jsx'
import LocationPage from './components/LocationPage.jsx'
import { Buddy } from './components/Characters.jsx'
import Countdown from './components/Countdown.jsx'
import Flights from './components/Flights.jsx'
import Activities from './components/Activities.jsx'
import Stamps from './components/Stamps.jsx'
import Gallery from './components/Gallery.jsx'
import Lock from './components/Lock.jsx'

export default function App() {
  const auth = useAuth()
  const canEdit = auth.loggedIn

  const [page, setPage] = useState('main') // 'main' | 'location'
  const [trip, setTrip] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const tripRef = useRef(null) // latest trip, for saves/polling
  const dirtyRef = useRef(false) // local edits not yet saved
  const saveTimer = useRef(null)

  // Load the shared trip from the server on mount.
  useEffect(() => {
    let alive = true
    api
      .getTrip()
      .then((t) => {
        if (!alive) return
        tripRef.current = t
        setTrip(t)
        setStatus('ready')
      })
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [])

  // Poll for other visitors' changes (skip while we have unsaved local edits).
  useEffect(() => {
    const id = setInterval(async () => {
      if (dirtyRef.current) return
      try {
        const t = await api.getTrip()
        if (!dirtyRef.current) {
          tripRef.current = t
          setTrip(t)
        }
      } catch {
        /* ignore transient poll errors */
      }
    }, 30000)
    return () => clearInterval(id)
  }, [])

  function commit(next) {
    tripRef.current = next
    setTrip(next)
    dirtyRef.current = true
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(saveNow, 400)
  }

  async function saveNow() {
    try {
      await api.saveTrip(tripRef.current, auth.token)
      dirtyRef.current = false
    } catch (err) {
      if (err.code === 401) {
        auth.logout()
        alert('Your session expired — please log in again.')
      } else {
        alert('Could not save to the server. Your change may not be shared.')
      }
    }
  }

  const updateTrip = (updater) => commit(updater(tripRef.current))

  // ── Flights ──
  async function refreshFlight(id) {
    const flight = tripRef.current.flights.find((f) => f.id === id)
    if (!flight) return
    const date = (flight.depart || '').slice(0, 10)
    const live = await fetchFlightStatus(flight.flightNo, date)
    const next = {
      ...tripRef.current,
      flights: tripRef.current.flights.map((f) =>
        f.id === id
          ? { ...f, ...live, from: { ...f.from, ...live.from }, to: { ...f.to, ...live.to } }
          : f,
      ),
    }
    // Only persist (share) live status if we're logged in; viewers update locally.
    if (auth.token) commit(next)
    else {
      tripRef.current = next
      setTrip(next)
    }
  }

  // ── Activities ──
  const toggleActivity = (id) =>
    updateTrip((t) => ({
      ...t,
      activities: t.activities.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    }))

  const deleteActivity = (id) =>
    updateTrip((t) => ({ ...t, activities: t.activities.filter((a) => a.id !== id) }))

  const addActivity = (data) =>
    updateTrip((t) => ({
      ...t,
      activities: [...t.activities, { id: 'a' + Date.now(), done: false, ...data }],
    }))

  // ── Stamps ──
  // Upload a PNG (transparency kept) and return its URL for use as a stamp face.
  const uploadStampImage = async (file) => {
    const blob = await fileToResizedBlob(file, { maxSize: 512, mime: 'image/png' })
    return api.uploadImage(blob, auth.token)
  }

  const addStamp = (data) =>
    updateTrip((t) => ({
      ...t,
      stamps: [
        ...(t.stamps ?? []),
        { id: 's' + Date.now(), tilt: Math.round(Math.random() * 16 - 8), ...data },
      ],
    }))

  const toggleStamp = (id) =>
    updateTrip((t) => ({
      ...t,
      stamps: (t.stamps ?? []).map((s) =>
        s.id === id
          ? { ...s, earned: !s.earned, date: !s.earned && !s.date ? new Date().toISOString().slice(0, 10) : s.date }
          : s,
      ),
    }))

  const deleteStamp = (id) =>
    updateTrip((t) => ({ ...t, stamps: (t.stamps ?? []).filter((s) => s.id !== id) }))

  // ── Gallery ──
  async function addGalleryImages(files) {
    const urls = []
    for (const file of files) {
      const blob = await fileToResizedBlob(file)
      urls.push(await api.uploadImage(blob, auth.token))
    }
    updateTrip((t) => ({
      ...t,
      gallery: [
        ...(t.gallery ?? []),
        ...urls.map((src, i) => ({ id: `g${Date.now()}-${i}`, type: 'image', src })),
      ],
    }))
  }

  const addGalleryVideo = (url, videoId) =>
    updateTrip((t) => ({
      ...t,
      gallery: [...(t.gallery ?? []), { id: `g${Date.now()}`, type: 'video', url, videoId }],
    }))

  const deleteGalleryItem = (id) =>
    updateTrip((t) => ({ ...t, gallery: (t.gallery ?? []).filter((g) => g.id !== id) }))

  if (page === 'location') {
    return <LocationPage onBack={() => setPage('main')} />
  }

  if (status === 'loading') {
    return (
      <div className="app">
        <Petals />
        <main className="container">
          <p className="loading">Loading your trip… 🌸</p>
        </main>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="app">
        <Petals />
        <main className="container">
          <p className="flight-error">
            ⚠️ Couldn't reach the server. Make sure the API is running, then refresh.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Petals />
      <main className="container">
        <div className="topbar">
          <button className="location-nav-btn" onClick={() => setPage('location')}>
            📍 My Location
          </button>
          <Lock loggedIn={auth.loggedIn} onLogin={auth.login} onLogout={auth.logout} />
        </div>
        <div className="hero-row">
          <Buddy src="/characters/buddy-1.png" name="Buddy 1" className="buddy--side" />
          <Header meta={trip.tripMeta} />
          <Buddy src="/characters/buddy-2.png" name="Buddy 2" className="buddy--side" />
        </div>
        <Countdown target={trip.tripMeta.startDate} />
        <Flights flights={trip.flights} onRefresh={refreshFlight} />
        <Activities
          activities={trip.activities}
          onToggle={toggleActivity}
          onDelete={deleteActivity}
          onAdd={addActivity}
          canEdit={canEdit}
        />
        <Stamps
          stamps={trip.stamps ?? []}
          onAdd={addStamp}
          onToggle={toggleStamp}
          onDelete={deleteStamp}
          onUpload={uploadStampImage}
          canEdit={canEdit}
        />
        <Gallery
          items={trip.gallery ?? []}
          onAddImages={addGalleryImages}
          onAddVideo={addGalleryVideo}
          onDelete={deleteGalleryItem}
          canEdit={canEdit}
        />
        <footer className="footer">
          <p className="footer-note">Made with 🌸 · shared trip, saved on the server.</p>
        </footer>
      </main>
    </div>
  )
}
