import type { AppState } from '../../types'
import { calculateGoldValue, calculateFundValue, calculateDepositValue } from '../../utils/calculations'
import { formatVND } from '../../utils/format'

interface Props { state: AppState }

export function AllocationTable({ state }: Props) {
  const { goldHoldings, goldPrice, mutualFundHoldings, fundNAVs, bankDeposits } = state

  const goldTotal = goldHoldings.reduce((s, h) => {
    const c = calculateGoldValue(h, goldPrice); return s + (c.currentValue ?? c.costBasis)
  }, 0)
  const fundTotal = mutualFundHoldings.reduce((s, h) => {
    const c = calculateFundValue(h, fundNAVs); return s + (c.currentValue ?? c.costBasis)
  }, 0)
  const depositTotal = bankDeposits.reduce((s, d) => {
    const c = calculateDepositValue(d); return s + c.maturityValue
  }, 0)

  const total = goldTotal + fundTotal + depositTotal
  if (!total) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-gray-300">No holdings yet</p>
      </div>
    )
  }

  const rows = [
    { name: 'Gold', value: goldTotal, color: '#CA8A04' },
    { name: 'Mutual Funds', value: fundTotal, color: '#1E3A8A' },
    { name: 'Bank Deposits', value: depositTotal, color: '#059669' },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Breakdown</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <th className="text-left pb-3 font-medium">Domain</th>
            <th className="text-right pb-3 font-medium">Value</th>
            <th className="text-right pb-3 font-medium">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="py-3 flex items-center gap-2 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                {r.name}
              </td>
              <td className="py-3 text-right font-medium text-gray-800">{formatVND(r.value)}</td>
              <td className="py-3 text-right text-gray-400">{((r.value / total) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200">
            <td className="pt-3 font-semibold text-gray-900">Total</td>
            <td className="pt-3 text-right font-semibold text-gray-900">{formatVND(total)}</td>
            <td className="pt-3 text-right text-gray-500">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
