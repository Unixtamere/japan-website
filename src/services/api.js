// Talks to the server that holds the shared trip.

export async function getTrip() {
  const res = await fetch('/api/trip')
  if (!res.ok) throw new Error('Failed to load the trip.')
  return res.json()
}

export async function login(passcode) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Login failed.')
  }
  return (await res.json()).token
}

export async function saveTrip(trip, token) {
  const res = await fetch('/api/trip', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(trip),
  })
  if (!res.ok) {
    const err = new Error('Could not save to the server.')
    err.code = res.status
    throw err
  }
  return res.json()
}

export async function uploadImage(blob, token) {
  const form = new FormData()
  form.append('image', blob, 'photo.jpg')
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || 'Upload failed.')
    err.code = res.status
    throw err
  }
  return (await res.json()).url
}
