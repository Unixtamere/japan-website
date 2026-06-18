import { useRef, useState } from 'react'
import { youtubeId } from '../utils/youtube.js'

export default function Gallery({ items, onAddImages, onAddVideo, onDelete, canEdit }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [active, setActive] = useState(null) // item shown in the lightbox
  const fileRef = useRef(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // let the same file be picked again later
    if (!files.length) return
    setError('')
    setBusy(true)
    try {
      await onAddImages(files)
    } catch (err) {
      setError(err.message || 'Could not add image.')
    } finally {
      setBusy(false)
    }
  }

  function handleAddVideo(e) {
    e.preventDefault()
    const id = youtubeId(url)
    if (!id) {
      setError("That doesn't look like a YouTube link.")
      return
    }
    onAddVideo(url.trim(), id)
    setUrl('')
    setError('')
  }

  return (
    <section className="section" id="gallery">
      <h2 className="section-title">
        <span className="section-emoji">📸</span> Gallery
      </h2>

      {canEdit && (
        <div className="gallery-controls">
          <button
            className="btn btn--primary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {busy ? '⏳ Adding…' : '⬆️ Upload images'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFiles}
          />
          <form className="gallery-video-form" onSubmit={handleAddVideo}>
            <input
              className="add-input"
              placeholder="Paste a YouTube link…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="btn btn--ghost" type="submit">
              ＋ Add video
            </button>
          </form>
        </div>
      )}

      {canEdit && error && <p className="flight-error">⚠️ {error}</p>}

      {items.length === 0 ? (
        <p className="empty">No photos or videos yet — add some memories! 🌸</p>
      ) : (
        <div className="gallery-grid">
          {items.map((item) => (
            <figure className="gallery-item" key={item.id}>
              {item.type === 'image' ? (
                <button
                  className="gallery-open"
                  onClick={() => setActive(item)}
                  aria-label="View photo"
                >
                  <img src={item.src} alt={item.caption || 'Trip photo'} loading="lazy" />
                </button>
              ) : (
                <button
                  className="gallery-open gallery-video"
                  onClick={() => setActive(item)}
                  aria-label="Play video"
                >
                  <img
                    src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                    alt="Video thumbnail"
                    loading="lazy"
                  />
                  <span className="gallery-play">▶</span>
                </button>
              )}
              {canEdit && (
                <button
                  className="gallery-delete"
                  onClick={() => onDelete(item.id)}
                  aria-label="Delete"
                  title="Delete"
                >
                  ✕
                </button>
              )}
            </figure>
          ))}
        </div>
      )}

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <button className="lightbox-close" aria-label="Close">
            ✕
          </button>
          <div className="lightbox-body" onClick={(e) => e.stopPropagation()}>
            {active.type === 'image' ? (
              <img src={active.src} alt={active.caption || 'Trip photo'} />
            ) : (
              <div className="lightbox-video">
                <iframe
                  src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
