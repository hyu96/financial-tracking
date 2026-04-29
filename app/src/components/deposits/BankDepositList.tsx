import type { BankDeposit } from '../../types'
import { calculateDepositValue } from '../../utils/calculations'
import { formatVND } from '../../utils/format'
import { BankDepositForm } from './BankDepositForm'
import { useUIStore } from '../../store/uiStore'

interface Props {
  deposits: BankDeposit[]
  onUpdate: (id: string, data: Omit<BankDeposit, 'id'>) => void
  onDelete: (id: string) => void
}

export function BankDepositList({ deposits, onUpdate, onDelete }: Props) {
  const editId = useUIStore((s) => s.depositEditId)
  const confirmId = useUIStore((s) => s.depositConfirmId)
  const setEditId = useUIStore((s) => s.setDepositEditId)
  const setConfirmId = useUIStore((s) => s.setDepositConfirmId)

  if (!deposits.length) {
    return (
      <div className="py-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ECFDF5' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No bank deposits yet</p>
        <p className="text-xs text-gray-300">Add your first deposit above</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {deposits.map((d) => {
        const calc = calculateDepositValue(d)
        const matured = calc.status === 'Matured'

        if (editId === d.id) {
          return (
            <div key={d.id} className="border border-gray-200 rounded-xl p-4">
              <BankDepositForm initial={d} onSave={(data) => { onUpdate(d.id, data); setEditId(null) }} onCancel={() => setEditId(null)} />
            </div>
          )
        }

        return (
          <div
            key={d.id}
            className="border rounded-xl p-4 transition-colors duration-150"
            style={{
              borderColor: matured ? '#A7F3D0' : '#E2E8F0',
              backgroundColor: matured ? '#F0FDF4' : '#fff',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm">{d.bankName} - {d.termMonths} months</p>
                  {d.label && <><span className="text-xs text-gray-400">·</span><p className="text-sm text-gray-600">{d.label}</p></>}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={matured
                      ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                      : { backgroundColor: '#EFF6FF', color: '#1E40AF' }
                    }
                  >
                    {matured ? 'Matured' : `Active · ${calc.daysRemaining}d left`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{formatVND(d.principal)} principal · {d.annualRate}% p.a. · {d.startDate} → {calc.maturityDate}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Stat label="Principal" value={formatVND(d.principal)} />
                  <Stat label="Interest" value={formatVND(calc.interest)} color="#059669" />
                  <Stat label="Maturity Value" value={formatVND(calc.maturityValue)} />
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setEditId(d.id)} className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">Edit</button>
                {confirmId === d.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => { onDelete(d.id); setConfirmId(null) }} className="text-xs px-2.5 py-1.5 bg-red-500 text-white rounded-lg cursor-pointer">Confirm</button>
                    <button onClick={() => setConfirmId(null)} className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 cursor-pointer">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(d.id)} className="text-xs px-2.5 py-1.5 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">Delete</button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold" style={{ color: color ?? '#1E293B' }}>{value}</p>
    </div>
  )
}
