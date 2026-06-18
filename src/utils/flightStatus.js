// Works out a flight's current phase dynamically, from live API data when we
// have it (flight.rawStatus) and otherwise from the scheduled times vs. now.

export const STATUS_META = {
  'To Board': { className: 'to-board', emoji: '🧳' },
  Boarding: { className: 'boarding', emoji: '🚶' },
  'In Flight': { className: 'in-flight', emoji: '✈️' },
  Landed: { className: 'landed', emoji: '🛬' },
  Delayed: { className: 'delayed', emoji: '⏰' },
  Cancelled: { className: 'cancelled', emoji: '❌' },
}

// How long before departure we start showing "Boarding".
const BOARDING_LEAD_MS = 45 * 60 * 1000

export function computeStatus(flight, now = Date.now()) {
  const raw = (flight.rawStatus || '').toLowerCase()
  const depart = flight.depart ? new Date(flight.depart).getTime() : NaN
  const arrive = flight.arrive ? new Date(flight.arrive).getTime() : NaN

  // 1) Live API signals win when present.
  if (raw.includes('cancel')) return 'Cancelled'
  if (raw.includes('arriv') || raw.includes('land')) return 'Landed'
  if (raw.includes('route') || raw.includes('depart') || raw.includes('approach'))
    return 'In Flight'
  if (raw.includes('board') || raw.includes('gate')) return 'Boarding'

  // 2) Otherwise derive the phase from the clock.
  if (!Number.isNaN(arrive) && now >= arrive) return 'Landed'
  if (!Number.isNaN(depart) && now >= depart) return 'In Flight'
  if (raw.includes('delay')) return 'Delayed'
  if (!Number.isNaN(depart) && depart - now <= BOARDING_LEAD_MS) return 'Boarding'

  // 3) Hasn't started yet.
  return 'To Board'
}
