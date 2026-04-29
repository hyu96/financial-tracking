import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { AppState } from '../../types'
import { calculateGoldValue, calculateFundValue, calculateDepositValue } from '../../utils/calculations'
import { formatVND } from '../../utils/format'

const COLORS = ['#CA8A04', '#1E3A8A', '#059669']

interface Props { state: AppState }

export function AllocationChart({ state }: Props) {
  const { goldHoldings, goldPrice, mutualFundHoldings, fundNAVs, bankDeposits } = state

  const goldTotal = goldHoldings.reduce((sum, h) => {
    const c = calculateGoldValue(h, goldPrice)
    return sum + (c.currentValue ?? c.costBasis)
  }, 0)
  const fundTotal = mutualFundHoldings.reduce((sum, h) => {
    const c = calculateFundValue(h, fundNAVs)
    return sum + (c.currentValue ?? c.costBasis)
  }, 0)
  const depositTotal = bankDeposits.reduce((sum, d) => {
    const c = calculateDepositValue(d)
    return sum + c.maturityValue
  }, 0)

  const data = [
    { name: 'Gold', value: goldTotal },
    { name: 'Mutual Funds', value: fundTotal },
    { name: 'Bank Deposits', value: depositTotal },
  ].filter((d) => d.value > 0)

  if (!data.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[220px]">
        <p className="text-sm text-gray-300">No holdings to display</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Allocation</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(v) => formatVND(Number(v))}
            contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'IBM Plex Sans, sans-serif' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i] }} />
              {d.name}
            </span>
            <span className="text-gray-500 text-xs">{((d.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
