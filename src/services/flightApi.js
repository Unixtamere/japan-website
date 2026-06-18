// Talks to our own dev proxy (/api/flight/...), which forwards to AeroDataBox.
// Returns a normalized object the FlightCard can merge into a flight.

// Map AeroDataBox's many status strings onto our 5 badge values.
function mapStatus(raw) {
  const s = (raw || '').toLowerCase()
  if (s.includes('cancel')) return 'Cancelled'
  if (s.includes('board') || s.includes('gate')) return 'Boarding'
  if (s.includes('delay')) return 'Delayed'
  if (s.includes('arriv') || s.includes('land')) return 'Landed'
  // Departed / EnRoute / Approaching / Diverted -> treat as in-progress
  if (s.includes('route') || s.includes('depart') || s.includes('approach')) return 'Boarding'
  return 'On time' // Scheduled / Expected / Unknown
}

// AeroDataBox times look like "2026-07-01 13:30+02:00" (space, not T).
// Prefer the UTC value and make it a proper ISO string the browser localizes.
function pickIso(timeObj) {
  if (!timeObj) return undefined
  const value = timeObj.utc || timeObj.local
  return value ? value.replace(' ', 'T') : undefined
}

export async function fetchFlightStatus(flightNumber, date) {
  const number = String(flightNumber).replace(/\s+/g, '')
  const res = await fetch(`/api/flight/${encodeURIComponent(number)}/${encodeURIComponent(date)}`)

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Lookup failed (HTTP ${res.status}).`)
  }

  if (!res.ok) {
    throw new Error(data?.error || `Lookup failed (HTTP ${res.status}).`)
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No data for ${number} on ${date} (free tier only covers a limited date window).`)
  }

  // A daily flight number returns one entry per day around the date, so pick the
  // leg whose local departure date matches the date we asked for (fall back to first).
  const f =
    data.find((item) => {
      const t = item.departure?.scheduledTime
      const local = t?.local || t?.utc || ''
      return local.startsWith(date)
    }) || data[0]
  const dep = f.departure || {}
  const arr = f.arrival || {}

  return {
    status: mapStatus(f.status),
    rawStatus: f.status || 'Unknown',
    from: {
      code: dep.airport?.iata || dep.airport?.icao,
      city: dep.airport?.municipalityName || dep.airport?.shortName || dep.airport?.name,
    },
    to: {
      code: arr.airport?.iata || arr.airport?.icao,
      city: arr.airport?.municipalityName || arr.airport?.shortName || arr.airport?.name,
    },
    depart: pickIso(dep.revisedTime) || pickIso(dep.scheduledTime),
    arrive: pickIso(arr.revisedTime) || pickIso(arr.scheduledTime),
    terminal: dep.terminal,
    gate: dep.gate,
    aircraft: f.aircraft?.model,
    checkedAt: Date.now(),
  }
}
