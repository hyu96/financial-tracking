import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import { formatVND, formatPct } from '../utils/format'

type Lot = {
  id: string
  fundName: string
  purchaseDate: string
  units: number
  purchaseNav: number
}

type FundNav = { fundName: string; value: number; updatedAt: string }

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold truncate" style={{ color: color ?? '#0F172A' }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function FundDetailPage() {
  const { fund } = useParams<{ fund: string }>()

  const { data: lots, isLoading: lotsLoading } = useQuery({
    queryKey: ['fund-lots', fund],
    queryFn: () => api.get<Lot[]>(`/mutual-funds/lots/${fund}`),
    enabled: !!fund,
  })

  const { data: navs } = useQuery({
    queryKey: ['fund-navs'],
    queryFn: () => api.get<FundNav[]>('/mutual-funds/navs'),
  })

  const nav = navs?.find((n) => n.fundName === fund)
  const currentNav = nav?.value ?? null

  const rows = (lots ?? []).map((lot) => {
    if (currentNav === null) {
      return { lot, currentValue: null, pnl: null, pnlPct: null }
    }
    const currentValue = lot.units * currentNav
    const pnl = (currentNav - lot.purchaseNav) * lot.units
    const pnlPct = ((currentNav - lot.purchaseNav) / lot.purchaseNav) * 100
    return { lot, currentValue, pnl, pnlPct }
  })

  const totalUnits = rows.reduce((s, r) => s + r.lot.units, 0)
  const totalCurrentValue = currentNav !== null ? rows.reduce((s, r) => s + (r.currentValue ?? 0), 0) : null
  const totalCost = rows.reduce((s, r) => s + r.lot.units * r.lot.purchaseNav, 0)
  const totalPnl = currentNav !== null ? rows.reduce((s, r) => s + (r.pnl ?? 0), 0) : null
  const totalPnlPct = totalCost > 0 && totalPnl !== null ? (totalPnl / totalCost) * 100 : null

  const pnlPositive = (totalPnl ?? 0) >= 0

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        to="/funds"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer"
        style={{ color: '#1E40AF' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Funds
      </Link>

      {/* Fund header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: '#1E40AF' }}>
          {fund?.slice(0, 2)}
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#0F172A' }}>{fund}</h2>
          <p className="text-sm" style={{ color: '#475569' }}>{rows.length} purchase lots · {totalUnits.toLocaleString('vi-VN')} units total</p>
        </div>
        {currentNav !== null ? (
          <span className="ml-auto px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
            {formatVND(currentNav)} / unit
          </span>
        ) : (
          <span className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500">
            No price available
          </span>
        )}
      </div>

      {/* Summary stats */}
      {currentNav !== null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Invested" value={formatVND(totalCost)} />
          <StatCard label="Current Value" value={totalCurrentValue !== null ? formatVND(totalCurrentValue) : '—'} />
          <StatCard
            label="Total P&L"
            value={totalPnl !== null ? `${totalPnl >= 0 ? '+' : ''}${formatVND(totalPnl)}` : '—'}
            color={pnlPositive ? '#059669' : '#DC2626'}
          />
          <StatCard
            label="Return"
            value={totalPnlPct !== null ? formatPct(totalPnlPct) : '—'}
            sub={totalPnl !== null ? (pnlPositive ? 'Profit' : 'Loss') : undefined}
            color={pnlPositive ? '#059669' : '#DC2626'}
          />
        </div>
      )}

      {/* Lots table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {lotsLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading lots…</p>
          </div>
        ) : !rows.length ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No purchase lots found for {fund}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Units</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Buy Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Current Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>P&amp;L</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>P&amp;L %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ lot, currentValue, pnl, pnlPct }, idx) => {
                  const isNeg = pnl !== null && pnl < 0
                  const pnlColor = pnl === null ? '#94A3B8' : pnl >= 0 ? '#059669' : '#DC2626'
                  const pnlBg = pnl === null ? '' : pnl >= 0 ? 'rgba(5,150,105,0.06)' : 'rgba(220,38,38,0.06)'
                  return (
                    <tr
                      key={lot.id}
                      className="transition-colors duration-150 hover:bg-blue-50"
                      style={{ borderBottom: '1px solid #F1F5F9' }}
                    >
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: '#94A3B8' }}>{idx + 1}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#334155' }}>{lot.purchaseDate}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: '#475569' }}>{lot.units.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap" style={{ color: '#475569' }}>{formatVND(lot.purchaseNav)}</td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap" style={{ color: '#475569' }}>{formatVND(lot.units * lot.purchaseNav)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap" style={{ color: '#0F172A' }}>
                        {currentValue !== null ? formatVND(currentValue) : <span style={{ color: '#94A3B8' }}>—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap rounded-sm" style={{ color: pnlColor, backgroundColor: pnlBg }}>
                        {pnl !== null ? `${pnl >= 0 ? '+' : ''}${formatVND(pnl)}` : <span style={{ color: '#94A3B8' }}>—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: pnlColor }}>
                        {pnlPct !== null ? (
                          <span className="inline-flex items-center gap-1">
                            {isNeg ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true"><polyline points="18 15 12 9 6 15" style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }} /></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true"><polyline points="18 15 12 9 6 15" /></svg>
                            )}
                            {formatPct(pnlPct)}
                          </span>
                        ) : <span style={{ color: '#94A3B8' }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <td className="px-4 py-3 font-bold text-xs uppercase tracking-wider" style={{ color: '#64748B' }} colSpan={2}>Total</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: '#0F172A' }}>{totalUnits.toLocaleString('vi-VN')}</td>
                  <td />
                  <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap" style={{ color: '#0F172A' }}>{formatVND(totalCost)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap" style={{ color: '#0F172A' }}>
                    {totalCurrentValue !== null ? formatVND(totalCurrentValue) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap" style={{ color: pnlPositive ? '#059669' : '#DC2626' }}>
                    {totalPnl !== null ? `${totalPnl >= 0 ? '+' : ''}${formatVND(totalPnl)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: pnlPositive ? '#059669' : '#DC2626' }}>
                    {totalPnlPct !== null ? formatPct(totalPnlPct) : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
