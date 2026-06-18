import { formatDate } from '../utils/format.js'
import { mapsUrl } from '../utils/maps.js'

export default function ActivityCard({ activity, onToggle, onDelete, canEdit }) {
  return (
    <article className={'activity-card' + (activity.done ? ' is-done' : '')}>
      <label className={'activity-check' + (canEdit ? '' : ' is-locked')}>
        <input
          type="checkbox"
          checked={activity.done}
          onChange={() => onToggle(activity.id)}
          disabled={!canEdit}
          aria-label={`Mark ${activity.title} as done`}
        />
        <span className="activity-check-box">✓</span>
      </label>

      <div className="activity-body">
        <div className="activity-meta">
          {activity.city && <span className="activity-city">{activity.city}</span>}
          {activity.date && <span className="activity-date">{formatDate(activity.date)}</span>}
          {activity.time && <span className="activity-time">{activity.time}</span>}
        </div>
        <h3 className="activity-title">
          {activity.emoji && <span className="activity-emoji">{activity.emoji}</span>}
          {activity.title}
        </h3>
        {activity.note && <p className="activity-note">{activity.note}</p>}
        <a
          className="activity-map"
          href={mapsUrl(activity)}
          target="_blank"
          rel="noopener noreferrer"
        >
          📍 Open in Maps
        </a>
      </div>

      {canEdit && (
        <button
          className="activity-delete"
          onClick={() => onDelete(activity.id)}
          aria-label={`Delete ${activity.title}`}
          title="Delete"
        >
          ✕
        </button>
      )}
    </article>
  )
}
