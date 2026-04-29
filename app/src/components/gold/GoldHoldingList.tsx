import type { GoldHolding, GoldPrice } from '../../types'
import { calculateGoldValue } from '../../utils/calculations'
import { formatVND, formatPct } from '../../utils/format'
import { GoldHoldingForm } from './GoldHoldingForm'
import { useUIStore } from '../../store/uiStore'

interface Props {
  holdings: GoldHolding[]
  price: GoldPrice | null
  onUpdate: (id: string, data: Omit<GoldHolding, 'id'>) => void
  onDelete: (id: string) => void
}

export function GoldHoldingList({ holdings, price, onUpdate, onDelete }: Props) {
  const editId = useUIStore((s) => s.goldEditId)
  const confirmId = useUIStore((s) => s.goldConfirmId)
  const setEditId = useUIStore((s) => s.setGoldEditId)
  const setConfirmId = useUIStore((s) => s.setGoldConfirmId)

  if (!holdings.length) {
    return (
      <div className="py-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No gold holdings yet</p>
        <p className="text-xs text-gray-300">Add your first holding above</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {holdings.map((h) => {
        const calc = calculateGoldValue(h, price)
        const pnlColor = calc.gainLoss === null ? '#94A3B8' : calc.gainLoss >= 0 ? '#059669' : '#DC2626'

        if (editId === h.id) {
          return (
            <div key={h.id} className="border border-gray-200 rounded-xl p-4">
              <GoldHoldingForm initial={h} onSave={(data) => { onUpdate(h.id, data); setEditId(null) }} onCancel={() => setEditId(null)} />
            </div>
          )
        }

        return (
          <div key={h.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800 text-sm">{h.label}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                    {h.weight} {h.unit}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Bought at {formatVND(h.purchasePrice)}/{h.unit} · {h.purchaseDate}</p>
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="Invested" value={formatVND(calc.costBasis)} />
                  <Stat label="Current" value={calc.currentValue !== null ? formatVND(calc.currentValue) : '—'} />
                  <Stat
                    label="P&L"
                    value={calc.gainLoss !== null ? `${calc.gainLoss >= 0 ? '+' : ''}${formatVND(calc.gainLoss)}` : '—'}
                    sub={calc.gainLossPct !== null ? formatPct(calc.gainLossPct) : undefined}
                    color={pnlColor}
                  />
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setEditId(h.id)} className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">Edit</button>
                {confirmId === h.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => { onDelete(h.id); setConfirmId(null) }} className="text-xs px-2.5 py-1.5 bg-red-500 text-white rounded-lg cursor-pointer">Confirm</button>
                    <button onClick={() => setConfirmId(null)} className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 cursor-pointer">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(h.id)} className="text-xs px-2.5 py-1.5 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">Delete</button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold" style={{ color: color ?? '#1E293B' }}>{value}</p>
      {sub && <p className="text-xs font-medium" style={{ color }}>{sub}</p>}
    </div>
  )
}
