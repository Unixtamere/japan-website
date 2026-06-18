import { useState } from 'react'

// Lock/login control. When logged out it shows "Log in"; clicking opens a
// dialog to enter the passcode (checked by the server). When logged in it shows
// a "Lock" button to drop back to view-only.
export default function Lock({ loggedIn, onLogin, onLogout }) {
  const [open, setOpen] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function close() {
    setOpen(false)
    setPass('')
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onLogin(pass)
      close()
    } catch (err) {
      setError(err.message || 'Wrong passcode.')
    } finally {
      setBusy(false)
    }
  }

  if (loggedIn) {
    return (
      <button className="lock-btn lock-btn--unlocked" onClick={onLogout}>
        🔓 Edit mode · Lock
      </button>
    )
  }

  return (
    <>
      <button className="lock-btn" onClick={() => setOpen(true)}>
        🔒 View only · Log in
      </button>
      {open && (
        <div className="lightbox" onClick={close}>
          <form className="lock-form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3 className="lock-title">🔐 Enter passcode</h3>
            <p className="lock-sub">
              Log in to add or remove activities, photos and videos for everyone.
            </p>
            <input
              className="add-input"
              type="password"
              placeholder="Passcode"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoFocus
            />
            {error && <p className="flight-error">⚠️ {error}</p>}
            <div className="add-actions">
              <button type="button" className="btn btn--ghost" onClick={close}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={busy}>
                {busy ? '…' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
