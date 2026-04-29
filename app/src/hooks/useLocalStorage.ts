import { useState, useEffect } from 'react'
import type { AppState } from '../types'
import { INITIAL_STATE } from '../types'

const STORAGE_KEY = 'financial-tracker-state'

export function useLocalStorage() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return INITIAL_STATE
      return JSON.parse(raw) as AppState
    } catch {
      return INITIAL_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, setState] as const
}
