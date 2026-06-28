import { useEffect, useState } from 'react'
import Petals from './Petals.jsx'

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const compassDir = (deg) => DIRS[Math.round(deg / 45) % 8]

export default function LocationPage({ onBack }) {
  const [pos, setPos] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState(null)

  async function refresh() {
    try {
      const r = await fetch('/api/location')
      const data = await r.json()
      if (!r.ok) {
        setError(data.error || 'Unknown error')
        setPos(null)
      } else {
        setPos(data)
        setError(null)
        setLastFetch(new Date())
      }
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [])

  const mapSrc = pos
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${pos.lon - 0.012},${pos.lat - 0.008},${pos.lon + 0.012},${pos.lat + 0.008}&layer=mapnik&marker=${pos.lat},${pos.lon}`
    : null

  const speedKmh = pos ? (pos.speed * 1.852).toFixed(1) : null
  const fixTime = pos ? new Date(pos.fixTime) : null
  const isSetupError = error && (error.includes('TRACCAR') || error.includes('set in .env'))

  return (
    <div className="app">
      <Petals />
      <main className="container">
        <div className="topbar">
          <button className="lock-btn" onClick={onBack}>← Back to trip</button>
        </div>

        <header className="hero" style={{ paddingBottom: '0.5rem' }}>
          <div className="hero-badge">📍 リアルタイム位置</div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>
            Live Location
          </h1>
          <p className="hero-subtitle">Calvin's whereabouts · tracked via Traccar</p>
        </header>

        <section className="section">
          {loading && !pos && <p className="loading">Fetching location… 🌸</p>}

          {error && (
            <div className="location-error">
              <p>⚠️ {error}</p>
              {isSetupError && (
                <p className="location-setup">
                  Add <code>TRACCAR_URL</code>, <code>TRACCAR_EMAIL</code>,{' '}
                  <code>TRACCAR_PASSWORD</code> (and optionally <code>TRACCAR_DEVICE_ID</code>) to
                  your <code>.env</code> file and restart the server.
                </p>
              )}
            </div>
          )}

          {pos && (
            <>
              <div className="location-map-wrap">
                <iframe
                  className="location-map"
                  title="Live location map"
                  src={mapSrc}
                  loading="lazy"
                />
                <a
                  className="location-osm-link"
                  href={`https://www.openstreetmap.org/?mlat=${pos.lat}&mlon=${pos.lon}#map=15/${pos.lat}/${pos.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in OpenStreetMap ↗
                </a>
              </div>

              <div className="location-stats">
                <div className="location-stat">
                  <span className="location-stat-icon">🌐</span>
                  <span className="location-stat-label">Coordinates</span>
                  <span className="location-stat-value">
                    {pos.lat.toFixed(5)}, {pos.lon.toFixed(5)}
                  </span>
                </div>

                <div className="location-stat">
                  <span className="location-stat-icon">🚀</span>
                  <span className="location-stat-label">Speed</span>
                  <span className="location-stat-value">{speedKmh} km/h</span>
                </div>

                {pos.course != null && (
                  <div className="location-stat">
                    <span className="location-stat-icon">🧭</span>
                    <span className="location-stat-label">Heading</span>
                    <span className="location-stat-value">
                      {compassDir(pos.course)} ({Math.round(pos.course)}°)
                    </span>
                  </div>
                )}

                {pos.altitude != null && (
                  <div className="location-stat">
                    <span className="location-stat-icon">⛰️</span>
                    <span className="location-stat-label">Altitude</span>
                    <span className="location-stat-value">{Math.round(pos.altitude)} m</span>
                  </div>
                )}

                {pos.accuracy != null && (
                  <div className="location-stat">
                    <span className="location-stat-icon">🎯</span>
                    <span className="location-stat-label">Accuracy</span>
                    <span className="location-stat-value">±{Math.round(pos.accuracy)} m</span>
                  </div>
                )}

                <div className="location-stat">
                  <span className="location-stat-icon">🕐</span>
                  <span className="location-stat-label">GPS fix</span>
                  <span className="location-stat-value">
                    {fixTime ? fixTime.toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              <div className="location-refresh-row">
                <span className="location-last-fetch">
                  {lastFetch ? `Updated at ${lastFetch.toLocaleTimeString()}` : ''}
                </span>
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setLoading(true)
                    refresh()
                  }}
                >
                  ↻ Refresh now
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
