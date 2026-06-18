import { useEffect, useState } from 'react'

function getRemaining(target) {
  const diff = new Date(target).getTime() - Date.now()
  const clamped = Math.max(diff, 0)
  return {
    over: diff <= 0,
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped / 3600000) % 24),
    minutes: Math.floor((clamped / 60000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  }
}

export default function Countdown({ target }) {
  const [time, setTime] = useState(() => getRemaining(target))

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (time.over) {
    return (
      <section className="countdown countdown--go">
        <span className="countdown-label">🎉 The adventure has begun — いってらっしゃい!</span>
      </section>
    )
  }

  const units = [
    { value: time.days, label: 'days' },
    { value: time.hours, label: 'hours' },
    { value: time.minutes, label: 'min' },
    { value: time.seconds, label: 'sec' },
  ]

  return (
    <section className="countdown" aria-label="Countdown to departure">
      <span className="countdown-label">✈️ Departing in</span>
      <div className="countdown-units">
        {units.map((u) => (
          <div className="countdown-unit" key={u.label}>
            <span className="countdown-value">{String(u.value).padStart(2, '0')}</span>
            <span className="countdown-unit-label">{u.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
