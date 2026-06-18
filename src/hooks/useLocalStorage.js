import { useEffect, useState } from 'react'

// Keeps a piece of state in sync with localStorage so the trip
// survives page reloads. Falls back to `initialValue` if nothing is
// stored yet or the stored value can't be parsed.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage might be full or blocked — ignore, state still works.
    }
  }, [key, value])

  return [value, setValue]
}
