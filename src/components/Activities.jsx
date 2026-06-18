import { useMemo, useState } from 'react'
import ActivityCard from './ActivityCard.jsx'
import AddActivity from './AddActivity.jsx'

export default function Activities({ activities, onToggle, onDelete, onAdd, canEdit }) {
  const [filter, setFilter] = useState('All')

  const cities = useMemo(() => {
    const set = new Set(activities.map((a) => a.city).filter(Boolean))
    return ['All', ...set]
  }, [activities])

  const visible =
    filter === 'All' ? activities : activities.filter((a) => a.city === filter)

  const doneCount = activities.filter((a) => a.done).length
  const total = activities.length
  const percent = total ? Math.round((doneCount / total) * 100) : 0

  return (
    <section className="section" id="activities">
      <h2 className="section-title">
        <span className="section-emoji">🗺️</span> Activities
      </h2>

      <div className="progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="progress-label">
          {doneCount} / {total} done · {percent}%
        </span>
      </div>

      <div className="filter-row">
        {cities.map((c) => (
          <button
            key={c}
            className={'chip' + (filter === c ? ' chip--active' : '')}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty">Nothing here yet — add your first activity! 🌸</p>
      ) : (
        <div className="activity-grid">
          {visible.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onToggle={onToggle}
              onDelete={onDelete}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {canEdit && <AddActivity onAdd={onAdd} />}
    </section>
  )
}
