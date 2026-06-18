import { useState } from 'react'
import { formatDate, formatTime } from '../utils/format.js'
import { computeStatus, STATUS_META } from '../utils/flightStatus.js'
import { useNow } from '../hooks/useNow.js'

export default function FlightCard({ flight, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const now = useNow(30000)

  const status = computeStatus(flight, now)
  const meta = STATUS_META[status]

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      await onRefresh(flight.id)
    } catch (err) {
      setError(err.message || 'Could not fetch live status.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="flight-card">
      <div className="flight-card-top">
        <span className="flight-airline">{flight.airline}</span>
        <span className="flight-no">{flight.flightNo}</span>
        <span
          className={'status status--' + meta.className}
          title={flight.rawStatus ? `Live: ${flight.rawStatus}` : 'Based on schedule'}
        >
          {meta.emoji} {status}
        </span>
      </div>

      <div className="flight-route">
        <div className="flight-endpoint">
          <span className="flight-code">{flight.from.code}</span>
          <span className="flight-city">{flight.from.city}</span>
          <span className="flight-time">{formatTime(flight.depart)}</span>
          <span className="flight-date">{formatDate(flight.depart)}</span>
        </div>

        <div className="flight-path">
          <span className="flight-plane">✈️</span>
        </div>

        <div className="flight-endpoint flight-endpoint--right">
          <span className="flight-code">{flight.to.code}</span>
          <span className="flight-city">{flight.to.city}</span>
          <span className="flight-time">{formatTime(flight.arrive)}</span>
          <span className="flight-date">{formatDate(flight.arrive)}</span>
        </div>
      </div>

      <div className="flight-card-bottom">
        <div className="flight-facts">
          {flight.seat && <span className="flight-seat">💺 {flight.seat}</span>}
          {flight.terminal && <span className="flight-seat">🛄 T{flight.terminal}</span>}
          {flight.gate && <span className="flight-seat">🚪 Gate {flight.gate}</span>}
          {flight.aircraft && <span className="flight-seat">🛩️ {flight.aircraft}</span>}
        </div>
        <button className="flight-refresh" onClick={refresh} disabled={loading}>
          {loading ? '⏳ Checking…' : '↻ Live'}
        </button>
      </div>

      {error && <p className="flight-error">⚠️ {error}</p>}
      {!error && flight.checkedAt && (
        <p className="flight-checked">
          Live: <strong>{flight.rawStatus}</strong> · updated{' '}
          {new Date(flight.checkedAt).toLocaleTimeString()}
        </p>
      )}
    </article>
  )
}
