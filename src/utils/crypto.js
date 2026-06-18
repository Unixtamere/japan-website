// SHA-256 hex digest using the browser's Web Crypto API. Available on localhost
// and any https site. We only ever store this hash of the passcode, not the
// passcode itself.
export async function sha256(text) {
  const data = new TextEncoder().encode('japan-trip::' + text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
