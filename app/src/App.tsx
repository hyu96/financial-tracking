import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { ExportImport } from './components/dashboard/ExportImport'
import { DashboardPage } from './pages/DashboardPage'
import { GoldPage } from './pages/GoldPage'
import { FundsPage } from './pages/FundsPage'
import { FundDetailPage } from './pages/FundDetailPage'
import { DepositsPage } from './pages/DepositsPage'
import { PlannerPage } from './pages/PlannerPage'
import { CallbackPage } from './pages/CallbackPage'
import { useAuth } from './context/AuthContext'

const TABS = [
  {
    path: '/',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/gold',
    label: 'Gold',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    path: '/funds',
    label: 'Mutual Funds',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    path: '/deposits',
    label: 'Bank Deposits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    path: '/planner',
    label: 'Planner',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

export default function App() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>

      {/* ── Header ── */}
      <header style={{ backgroundColor: '#0F172A' }} className="px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#CA8A04' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-tight">Financial Tracker</h1>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Personal investment overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportImport />
          {user && (
            <div className="flex items-center gap-2">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.displayName} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-medium">
                  {user.displayName.charAt(0)}
                </div>
              )}
              <span className="text-sm hidden sm:block" style={{ color: '#94A3B8' }}>{user.displayName}</span>
              <button onClick={signOut} className="text-xs px-2 py-1 rounded hover:bg-slate-700 transition-colors" style={{ color: '#94A3B8' }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Tab navigation ── */}
      <nav style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B' }} className="px-4">
        <div className="flex gap-1 max-w-4xl mx-auto overflow-x-auto">
          {TABS.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className="flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-150"
              style={{
                borderColor: isActive(t.path) ? '#CA8A04' : 'transparent',
                color: isActive(t.path) ? '#CA8A04' : '#94A3B8',
                textDecoration: 'none',
              }}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/gold" element={<GoldPage />} />
          <Route path="/funds" element={<FundsPage />} />
          <Route path="/funds/:fund" element={<FundDetailPage />} />
          <Route path="/deposits" element={<DepositsPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    </div>
  )
}
