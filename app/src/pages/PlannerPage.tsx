import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import { useGoldData } from '../hooks/useGoldData'
import { useFundData } from '../hooks/useFundData'
import { useDepositData } from '../hooks/useDepositData'
import { calculateGoldValue, calculateFundValue, calculateDepositValue } from '../utils/calculations'
import { formatVND } from '../utils/format'

type Target = { goldPct: number; fundPct: number; depositPct: number }

type DomainRow = {
  name: string
  color: string
  currentPct: number
  targetPct: number
  gapPct: number
  gapVnd: number
  instruction: string
}

function gapColor(gap: number): string {
  if (Math.abs(gap) <= 1) return '#059669'
  if (Math.abs(gap) < 10) return '#D97706'
  return '#DC2626'
}

function instruction(name: string, gapVnd: number, gapPct: number, goldPricePerTael?: number | null): string {
  if (Math.abs(gapPct) <= 1) return 'On target'
  const amt = formatVND(Math.abs(gapVnd))
  if (name === 'Bank Deposits') {
    return gapVnd > 0
      ? `Open new deposits with ~${amt}`
      : `When deposits mature, redirect ~${amt} — don't renew`
  }
  if (name === 'Gold' && goldPricePerTael && goldPricePerTael > 0) {
    const tael = Math.abs(gapVnd) / goldPricePerTael
    const taelStr = tael.toFixed(2)
    return gapVnd > 0
      ? `Invest ~${amt} more (~${taelStr} tael at current price)`
      : `Consider selling ~${amt} (~${taelStr} tael at current price)`
  }
  return gapVnd > 0
    ? `Invest ~${amt} more`
    : `Consider selling ~${amt}`
}

export function PlannerPage() {
  const qc = useQueryClient()
  const { data: goldData } = useGoldData()
  const { data: fundData } = useFundData()
  const { data: depositData } = useDepositData()

  const { data: savedTarget } = useQuery({
    queryKey: ['allocation-target'],
    queryFn: () => api.get<Target | null>('/allocation/target'),
  })

  const [gold, setGold] = useState('')
  const [fund, setFund] = useState('')
  const [deposit, setDeposit] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedTargets, setSavedTargets] = useState<Target | null>(null)

  // Pre-fill from saved target
  useEffect(() => {
    if (savedTarget) {
      setGold(String(savedTarget.goldPct))
      setFund(String(savedTarget.fundPct))
      setDeposit(String(savedTarget.depositPct))
      setSavedTargets(savedTarget)
    }
  }, [savedTarget])

  const goldNum = parseFloat(gold) || 0
  const fundNum = parseFloat(fund) || 0
  const depositNum = parseFloat(deposit) || 0
  const sum = goldNum + fundNum + depositNum
  const sumValid = Math.abs(sum - 100) < 0.01

  async function handleSave() {
    setSaving(true)
    try {
      const result = await api.put<Target>('/allocation/target', {
        goldPct: goldNum,
        fundPct: fundNum,
        depositPct: depositNum,
      })
      setSavedTargets(result)
      qc.invalidateQueries({ queryKey: ['allocation-target'] })
    } finally {
      setSaving(false)
    }
  }

  // Compute current domain values
  const goldHoldings = goldData?.holdings ?? []
  const goldPrice = goldData?.price ?? null
  const fundHoldings = fundData?.holdings ?? []
  const fundNavs = fundData?.navs ?? []
  const deposits = depositData?.deposits ?? []

  const goldValue = goldHoldings.reduce((s, h) => {
    const c = calculateGoldValue(h, goldPrice); return s + (c.currentValue ?? c.costBasis)
  }, 0)
  const fundValue = fundHoldings.reduce((s, h) => {
    const c = calculateFundValue(h, fundNavs); return s + (c.currentValue ?? c.costBasis)
  }, 0)
  const depositValue = deposits.reduce((s, d) => {
    const c = calculateDepositValue(d); return s + c.maturityValue
  }, 0)
  const total = goldValue + fundValue + depositValue

  // Gap analysis rows
  const rows: DomainRow[] = savedTargets && total > 0 ? [
    {
      name: 'Gold',
      color: '#CA8A04',
      currentPct: (goldValue / total) * 100,
      targetPct: savedTargets.goldPct,
      gapPct: savedTargets.goldPct - (goldValue / total) * 100,
      gapVnd: (savedTargets.goldPct / 100) * total - goldValue,
      instruction: '',
    },
    {
      name: 'Mutual Funds',
      color: '#1E40AF',
      currentPct: (fundValue / total) * 100,
      targetPct: savedTargets.fundPct,
      gapPct: savedTargets.fundPct - (fundValue / total) * 100,
      gapVnd: (savedTargets.fundPct / 100) * total - fundValue,
      instruction: '',
    },
    {
      name: 'Bank Deposits',
      color: '#059669',
      currentPct: (depositValue / total) * 100,
      targetPct: savedTargets.depositPct,
      gapPct: savedTargets.depositPct - (depositValue / total) * 100,
      gapVnd: (savedTargets.depositPct / 100) * total - depositValue,
      instruction: '',
    },
  ].map((r) => ({ ...r, instruction: instruction(r.name, r.gapVnd, r.gapPct, goldPrice?.value) })) : []

  return (
    <div className="space-y-6">
      {/* Target input */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Target Allocation</h2>
        <p className="text-xs text-gray-400 mb-5">Set your desired percentage for each domain. Must sum to 100%.</p>

        <div className="space-y-3 mb-5">
          {[
            { label: 'Gold', color: '#CA8A04', value: gold, set: setGold },
            { label: 'Mutual Funds', color: '#1E40AF', value: fund, set: setFund },
            { label: 'Bank Deposits', color: '#059669', value: deposit, set: setDeposit },
          ].map(({ label, color, value, set }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-36">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <div className="relative w-28">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right pr-7 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sum indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sum:</span>
            <span className="text-sm font-semibold" style={{ color: sumValid ? '#059669' : '#DC2626' }}>
              {sum.toFixed(1)}%
            </span>
            {!sumValid && sum > 0 && (
              <span className="text-xs" style={{ color: '#DC2626' }}>
                ({sum > 100 ? `+${(sum - 100).toFixed(1)}` : `-${(100 - sum).toFixed(1)}`} off)
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!sumValid || saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-150 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: sumValid ? '#1E40AF' : '#94A3B8' }}
          >
            {saving ? 'Saving…' : 'Save Targets'}
          </button>
        </div>
      </div>

      {/* Gap analysis */}
      {savedTargets && total > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">Gap Analysis</h2>
            <span className="text-xs text-gray-400">Total portfolio: {formatVND(total)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Domain</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Current</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Target</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Gap</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Gap (VND)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const color = gapColor(r.gapPct)
                  return (
                    <tr key={r.name} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td className="py-3 flex items-center gap-2 text-gray-700 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                        {r.name}
                      </td>
                      <td className="py-3 text-right text-gray-600">{r.currentPct.toFixed(1)}%</td>
                      <td className="py-3 text-right text-gray-600">{r.targetPct.toFixed(1)}%</td>
                      <td className="py-3 text-right font-semibold tabular-nums" style={{ color }}>
                        {Math.abs(r.gapPct) <= 1 ? '✓' : `${r.gapPct >= 0 ? '+' : ''}${r.gapPct.toFixed(1)}pp`}
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums whitespace-nowrap" style={{ color }}>
                        {Math.abs(r.gapPct) <= 1 ? '—' : `${r.gapVnd >= 0 ? '+' : ''}${formatVND(r.gapVnd)}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div className="mt-5 space-y-2 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Actions</p>
            {rows.map((r) => {
              const color = gapColor(r.gapPct)
              return (
                <div key={r.name} className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ backgroundColor: `${color}0D` }}>
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <span className="text-xs font-semibold text-gray-700">{r.name}: </span>
                    <span className="text-xs text-gray-600">{r.instruction}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {savedTargets && total === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">No portfolio data yet. Add holdings to see gap analysis.</p>
        </div>
      )}
    </div>
  )
}
