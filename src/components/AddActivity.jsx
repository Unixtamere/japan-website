import { useState } from 'react'

const EMPTY = { title: '', city: '', date: '', time: '', note: '', emoji: '📍', mapsUrl: '' }

export default function AddActivity({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd({ ...form, title: form.title.trim(), mapsUrl: form.mapsUrl.trim() })
    setForm(EMPTY)
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="add-toggle" onClick={() => setOpen(true)}>
        ＋ Add activity
      </button>
    )
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <div className="add-row">
        <input
          className="add-input add-emoji"
          value={form.emoji}
          onChange={(e) => update('emoji', e.target.value)}
          aria-label="Emoji"
          maxLength={2}
        />
        <input
          className="add-input add-grow"
          placeholder="What are you doing? *"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          autoFocus
        />
      </div>
      <div className="add-row">
        <input
          className="add-input"
          placeholder="City"
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
        />
        <input
          className="add-input"
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
        />
        <input
          className="add-input"
          type="time"
          value={form.time}
          onChange={(e) => update('time', e.target.value)}
        />
      </div>
      <textarea
        className="add-input add-note"
        placeholder="Notes (optional)"
        value={form.note}
        onChange={(e) => update('note', e.target.value)}
        rows={2}
      />
      <input
        className="add-input"
        type="url"
        placeholder="Google Maps link (optional — auto-generated if left blank)"
        value={form.mapsUrl}
        onChange={(e) => update('mapsUrl', e.target.value)}
      />
      <div className="add-actions">
        <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          Add
        </button>
      </div>
    </form>
  )
}
