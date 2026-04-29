import { Link } from 'react-router-dom'
import type { MutualFundHolding, FundNAV } from '../../types'
import { calculateFundValue } from '../../utils/calculations'
import { formatVND, formatPct } from '../../utils/format'
import { format } from 'date-fns'

interface Props {
  holdings: MutualFundHolding[]
  navs: FundNAV[]
}

function NavCell({ holding, navs }: { holding: MutualFundHolding; navs: FundNAV[] }) {
  const nav = navs.find((n) => n.fundName === holding.fundName)
  if (!nav) return <span className="text-xs text-gray-400">—</span>
  return (
    <span className="text-sm font-medium text-gray-800 whitespace-nowrap" title={`Updated ${format(new Date(nav.updatedAt), 'dd MMM yyyy')}`}>
      {formatVND(nav.currentNAV)}
    </span>
  )
}

export function MutualFundTable({ holdings, navs }: Props) {

  if (!holdings.length) {
    return (
      <div className="py-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No mutual fund holdings yet</p>
        <p className="text-xs text-gray-300">Add your first holding above</p>
      </div>
    )
  }

  let totalValue = 0
  let totalGainLoss = 0
  let totalCostBasis = 0
  let hasAllNavs = true

  const rows = holdings.map((h) => {
    const calc = calculateFundValue(h, navs)
    if (calc.currentValue !== null) {
      totalValue += calc.currentValue
      totalGainLoss += calc.gainLoss ?? 0
      totalCostBasis += calc.costBasis
    } else {
      hasAllNavs = false
    }
    return { h, calc }
  })

  const totalReturnPct = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Fund</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Units</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Avg Price</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Latest Price</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Value</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">P&amp;L</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">P&amp;L%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ h, calc }) => {
            const pnlColor = calc.gainLoss === null ? '#94A3B8' : calc.gainLoss >= 0 ? '#059669' : '#DC2626'
            return (
              <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold">
                  <Link to={`/funds/${h.fundName}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {h.fundName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{h.units.toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{formatVND(h.avgPurchaseNav)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <NavCell holding={h} navs={navs} />
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-800 whitespace-nowrap">
                  {calc.currentValue !== null ? formatVND(calc.currentValue) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium whitespace-nowrap" style={{ color: pnlColor }}>
                  {calc.gainLoss !== null ? `${calc.gainLoss >= 0 ? '+' : ''}${formatVND(calc.gainLoss)}` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: pnlColor }}>
                  {calc.returnPct !== null ? formatPct(calc.returnPct) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="px-4 py-3 font-bold text-gray-800 text-sm">Tổng</td>
            <td colSpan={3} />
            <td className="px-4 py-3 text-right font-bold text-gray-800 whitespace-nowrap">
              {totalValue > 0 ? formatVND(totalValue) : '—'}
            </td>
            <td className="px-4 py-3 text-right font-bold whitespace-nowrap" style={{ color: totalGainLoss >= 0 ? '#059669' : '#DC2626' }}>
              {(totalValue > 0 || !hasAllNavs) && totalCostBasis > 0
                ? `${totalGainLoss >= 0 ? '+' : ''}${formatVND(totalGainLoss)}`
                : '—'}
            </td>
            <td className="px-4 py-3 text-right font-bold" style={{ color: totalGainLoss >= 0 ? '#059669' : '#DC2626' }}>
              {totalReturnPct !== null && totalValue > 0 ? formatPct(totalReturnPct) : '—'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
