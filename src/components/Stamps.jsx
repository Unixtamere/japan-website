import { useRef, useState } from 'react'
import { formatDate } from '../utils/format.js'

const COLORS = ['#d6455d', '#4a5e9e', '#3f9b6e', '#c9952f', '#8a5ec4']
const EMPTY = { emoji: '⭐', label: '', date: '', color: COLORS[0], earned: true, image: '' }

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function Stamps({ stamps, onAdd, onToggle, onDelete, onUpload, canEdit }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const url = await onUpload(file)
      update('image', url)
    } catch (err) {
      setError(err.message || 'Could not upload image.')
    } finally {
      setBusy(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    if (!form.label.trim() && !form.image) return
    onAdd({
      ...form,
      label: form.label.trim(),
      date: form.date || (form.earned ? todayISO() : ''),
    })
    setForm(EMPTY)
    setOpen(false)
  }

  const earnedCount = stamps.filter((s) => s.earned).length

  return (
    <section className="section" id="stamps">
      <h2 className="section-title">
        <span className="section-emoji">🎌</span> Stamps
      </h2>
      <p className="stamps-sub">
        Collect a stamp for each achievement — <strong>{earnedCount}</strong> / {stamps.length}{' '}
        earned.
        {canEdit && stamps.length > 0 && ' Tap a stamp to stamp it!'}
      </p>

      {stamps.length === 0 ? (
        <p className="empty">No stamps yet — create your first achievement! 🌸</p>
      ) : (
        <div className="stamp-grid">
          {stamps.map((s) => (
            <figure
              key={s.id}
              className={'stamp' + (s.earned ? ' is-earned' : '')}
              style={{ '--stamp-ink': s.color, '--tilt': `${s.tilt || 0}deg` }}
            >
              <button
                className="stamp-face"
                onClick={() => canEdit && onToggle(s.id)}
                disabled={!canEdit}
                title={canEdit ? (s.earned ? 'Un-stamp' : 'Stamp it!') : ''}
              >
                {s.image ? (
                  <img className="stamp-img" src={s.image} alt={s.label || 'stamp'} />
                ) : (
                  <span className="stamp-emoji">{s.emoji}</span>
                )}
                {s.label && <span className="stamp-label">{s.label}</span>}
                {s.earned && s.date && <span className="stamp-date">{formatDate(s.date)}</span>}
              </button>
              {canEdit && (
                <button
                  className="stamp-delete"
                  onClick={() => onDelete(s.id)}
                  aria-label={`Delete ${s.label}`}
                  title="Delete"
                >
                  ✕
                </button>
              )}
            </figure>
          ))}
        </div>
      )}

      {canEdit &&
        (open ? (
          <form className="add-form" onSubmit={submit}>
            <div className="add-row">
              {form.image ? (
                <div className="stamp-upload-preview">
                  <img src={form.image} alt="stamp" />
                  <button
                    type="button"
                    className="stamp-upload-clear"
                    onClick={() => update('image', '')}
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <input
                  className="add-input add-emoji"
                  value={form.emoji}
                  onChange={(e) => update('emoji', e.target.value)}
                  aria-label="Emoji"
                  maxLength={2}
                />
              )}
              <input
                className="add-input add-grow"
                placeholder="Achievement name"
                value={form.label}
                onChange={(e) => update('label', e.target.value)}
                autoFocus
              />
            </div>
            <div className="add-row">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                {busy ? '⏳ Uploading…' : form.image ? '🖼️ Change PNG' : '🖼️ Use a PNG'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFile}
              />
              <span className="stamp-upload-hint">PNG with transparency looks best.</span>
            </div>
            {error && <p className="flight-error">⚠️ {error}</p>}
            <div className="add-row stamp-form-row">
              <div className="stamp-swatches">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={'swatch' + (form.color === c ? ' swatch--active' : '')}
                    style={{ background: c }}
                    onClick={() => update('color', c)}
                    aria-label={`Ink colour ${c}`}
                  />
                ))}
              </div>
              <input
                className="add-input"
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
              />
              <label className="stamp-earned-toggle">
                <input
                  type="checkbox"
                  checked={form.earned}
                  onChange={(e) => update('earned', e.target.checked)}
                />
                Earned
              </label>
            </div>
            <div className="add-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Create stamp
              </button>
            </div>
          </form>
        ) : (
          <button className="add-toggle" onClick={() => setOpen(true)}>
            ＋ Create stamp
          </button>
        ))}
    </section>
  )
}
