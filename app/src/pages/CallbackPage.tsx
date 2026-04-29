import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../lib/apiClient'

export function CallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setToken(token)
    }
    navigate('/', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Signing in…</p>
    </div>
  )
}
