import { formatVND, formatPct } from '../../utils/format'

interface Props {
  label: string
  icon: React.ReactNode
  accentColor: string
  totalInvested: number
  currentValue: number | null
  currentValueLabel?: string
  pnlLabel: string
  pnlValue: number | null
  pnlPct: number | null
  isEmpty: boolean
  isDeposit?: boolean
  onNavigate: () => void
}

export function DomainSummaryCard({
  label, icon, accentColor, totalInvested, currentValue, currentValueLabel = 'Current Value',
  pnlLabel, pnlValue, pnlPct, isEmpty, isDeposit = false, onNavigate,
}: Props) {
  const pnlColor = isDeposit
    ? '#059669'
    : pnlValue === null ? '#94A3B8'
    : pnlValue >= 0 ? '#059669' : '#DC2626'

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 transition-shadow duration-200 hover:shadow-md cursor-pointer"
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      aria-label={`View ${label} details`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate() }}
    >
      {/* Domain header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentColor + '18', color: accentColor }}>
            {icon}
          </div>
          <span className="font-semibold text-gray-800 text-sm">{label}</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-3 gap-1">
          <p className="text-sm text-gray-400">No holdings yet</p>
          <p className="text-xs text-gray-300">Tap to add your first</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Invested */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Invested</p>
            <p className="text-base font-semibold text-gray-800">{formatVND(totalInvested)}</p>
          </div>

          {/* Current value */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{currentValueLabel}</p>
            <p className="text-base font-semibold text-gray-900">
              {currentValue !== null ? formatVND(currentValue) : <span className="text-gray-300">—</span>}
            </p>
          </div>

          {/* P&L / interest */}
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{pnlLabel}</p>
            <p className="text-base font-bold" style={{ color: pnlColor }}>
              {pnlValue !== null ? (
                <>
                  {pnlValue >= 0 && !isDeposit ? '+' : ''}{formatVND(pnlValue)}
                  {pnlPct !== null && (
                    <span className="text-sm font-medium ml-1.5">{formatPct(pnlPct)}</span>
                  )}
                </>
              ) : (
                <span style={{ color: '#94A3B8' }}>—</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
