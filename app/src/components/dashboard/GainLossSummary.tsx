import type { AppState } from '../../types'
import { calculateGoldValue, calculateFundValue } from '../../utils/calculations'
import { formatVND, formatPct } from '../../utils/format'

interface Props { state: AppState }

export function GainLossSummary({ state }: Props) {
  const { goldHoldings, goldPrice, mutualFundHoldings, fundNAVs } = state

  let totalGain = 0
  let totalCost = 0
  let isPartial = false

  goldHoldings.forEach((h) => {
    const c = calculateGoldValue(h, goldPrice)
    totalCost += c.costBasis
    if (c.gainLoss !== null) totalGain += c.gainLoss
    else isPartial = true
  })

  mutualFundHoldings.forEach((h) => {
    const c = calculateFundValue(h, fundNAVs)
    totalCost += c.costBasis
    if (c.gainLoss !== null) totalGain += c.gainLoss
    else isPartial = true
  })

  if (!goldHoldings.length && !mutualFundHoldings.length) return null

  const pct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
        Unrealized Gain / Loss {isPartial && <span className="text-gray-400 font-normal normal-case">(partial)</span>}
      </h2>
      <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatVND(totalGain)}
      </p>
      {totalCost > 0 && (
        <p className={`text-sm mt-1 ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatPct(pct)} of invested capital</p>
      )}
      <p className="text-xs text-gray-400 mt-2">Gold + Mutual Funds only (bank deposits earn fixed interest)</p>
    </div>
  )
}
