import { type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { LoginPage } from '../pages/LoginPage'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  // Allow callback URL through so token can be extracted and stored
  if (window.location.pathname === '/callback') return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <>{children}</>
}
