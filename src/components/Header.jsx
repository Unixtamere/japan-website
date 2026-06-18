import { formatDate } from '../utils/format.js'

export default function Header({ meta }) {
  return (
    <header className="hero">
      <div className="hero-badge">⛩️ ようこそ・Welcome</div>
      <h1 className="hero-title">{meta.title}</h1>
      <p className="hero-subtitle">{meta.subtitle}</p>
      <div className="hero-dates">
        <span>🛫 {formatDate(meta.startDate)}</span>
        <span className="hero-dot">•</span>
        <span>🛬 {formatDate(meta.endDate)}</span>
      </div>
    </header>
  )
}
