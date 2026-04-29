import type { AppState } from '../../types'
import { calculateGoldValue, calculateFundValue, calculateDepositValue } from '../../utils/calculations'
import { formatVND, formatPct } from '../../utils/format'

interface Props {
  state: AppState
  dailyDeltaVnd?: number | null
  dailyDeltaPct?: number | null
}

export function PortfolioSummary({ state, dailyDeltaVnd, dailyDeltaPct }: Props) {
  const { goldHoldings, goldPrice, mutualFundHoldings, fundNAVs, bankDeposits } = state

  let totalValue = 0
  let totalCost = 0
  let isPartial = false

  goldHoldings.forEach((h) => {
    const c = calculateGoldValue(h, goldPrice)
    totalCost += c.costBasis
    if (c.currentValue !== null) totalValue += c.currentValue
    else { totalValue += c.costBasis; isPartial = true }
  })
  mutualFundHoldings.forEach((h) => {
    const c = calculateFundValue(h, fundNAVs)
    totalCost += c.costBasis
    if (c.currentValue !== null) totalValue += c.currentValue
    else { totalValue += c.costBasis; isPartial = true }
  })
  bankDeposits.forEach((d) => {
    const c = calculateDepositValue(d)
    totalCost += d.principal
    totalValue += c.maturityValue
  })

  const gainLoss = totalValue - totalCost
  const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0
  const isGain = gainLoss >= 0

  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' }}
    >
      <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>
        Total Portfolio Value {isPartial && <span style={{ color: '#EAB308' }}>(partial)</span>}
      </p>
      <p className="text-4xl font-bold tracking-tight text-white">{formatVND(totalValue)}</p>
      {totalCost > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: isGain ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)',
              color: isGain ? '#34D399' : '#F87171',
            }}
          >
            {isGain ? '▲' : '▼'} {formatVND(Math.abs(gainLoss))} ({formatPct(gainLossPct)})
          </span>
          <span className="text-xs" style={{ color: '#64748B' }}>overall return</span>
        </div>
      )}
      {dailyDeltaVnd !== null && dailyDeltaVnd !== undefined && dailyDeltaPct !== null && dailyDeltaPct !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: dailyDeltaVnd >= 0 ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)',
              color: dailyDeltaVnd >= 0 ? '#34D399' : '#F87171',
            }}
          >
            {dailyDeltaVnd >= 0 ? '▲' : '▼'} {formatVND(Math.abs(dailyDeltaVnd))} ({formatPct(dailyDeltaPct)})
          </span>
          <span className="text-xs" style={{ color: '#64748B' }}>vs yesterday</span>
        </div>
      )}
    </div>
  )
}
