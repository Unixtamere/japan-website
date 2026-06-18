import { useState } from 'react'

// A single travel-buddy image with a graceful fallback if the file isn't there
// yet. Drop the images into public/characters/ as buddy-1.png and buddy-2.png.
export function Buddy({ src, name, className = '' }) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <div className={`buddy buddy--missing ${className}`}>
        <span>🖼️</span>
        <small>
          Add <code>{src.replace('/', '')}</code> to <code>public/</code>
        </small>
      </div>
    )
  }

  return (
    <figure className={`buddy ${className}`}>
      <img src={src} alt={name} loading="lazy" onError={() => setBroken(true)} />
    </figure>
  )
}
