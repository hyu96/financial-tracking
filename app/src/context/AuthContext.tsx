import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, clearToken, BASE_URL } from '../lib/apiClient'

interface AuthUser {
  id: string
  email: string
  displayName: string
  photoUrl?: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AuthUser>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  function signIn() {
    window.location.href = `${BASE_URL}/auth/google`
  }

  function signOut() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
