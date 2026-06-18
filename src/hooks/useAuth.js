import { useState } from 'react'
import * as api from '../services/api.js'

// Server-backed login. The passcode is checked by the server, which returns a
// bearer token; write requests must carry it. The token lives in sessionStorage
// so it clears when the browser closes (and is invalidated on server restart).
const TOKEN_KEY = 'japan-token'

export function useAuth() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')

  async function login(passcode) {
    const t = await api.login(passcode) // throws on wrong passcode
    setToken(t)
    sessionStorage.setItem(TOKEN_KEY, t)
    return true
  }

  function logout() {
    setToken('')
    sessionStorage.removeItem(TOKEN_KEY)
  }

  return { token, loggedIn: !!token, login, logout }
}
