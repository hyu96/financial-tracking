import type { ReactNode } from 'react'
import { formatVND } from '../../utils/format'
import { format } from 'date-fns'

type ValueFormat = 'vnd' | 'usd' | 'points'

interface Props {
  label: string
  icon: ReactNode
  value: number | null
  updatedAt: string | null
  accentColor: string
  onSync: () => void
  syncing: boolean
  valueFormat?: ValueFormat
}

function formatValue(value: number, fmt: ValueFormat): string {
  if (fmt === 'usd') return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (fmt === 'points') return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts`
  return formatVND(value)
}

export function PriceWidget({ label, icon, value, updatedAt, accentColor, onSync, syncing, valueFormat = 'vnd' }: Props) {
  const formattedTime = updatedAt
    ? (() => { try { return format(new Date(updatedAt), 'dd MMM yyyy, HH:mm') } catch { return updatedAt } })()
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
            {icon}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>{label}</span>
        </div>
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          aria-label={`Sync ${label}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {syncing ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      {/* Price */}
      <div>
        <p className="text-2xl font-bold tabular-nums" style={{ color: value !== null ? '#0F172A' : '#94A3B8' }}>
          {value !== null ? formatValue(value, valueFormat) : '—'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
          {formattedTime ? `Updated ${formattedTime}` : 'Not synced yet'}
        </p>
      </div>
    </div>
  )
}
