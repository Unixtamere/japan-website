// Extracts the 11-char video ID from any common YouTube URL form, or accepts
// a bare ID. Returns null if it doesn't look like YouTube.
export function youtubeId(input) {
  if (!input) return null
  const url = input.trim()
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  if (/^[\w-]{11}$/.test(url)) return url
  return null
}
