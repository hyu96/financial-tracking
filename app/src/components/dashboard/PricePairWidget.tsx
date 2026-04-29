import type { ReactNode } from 'react'
import { formatVND } from '../../utils/format'
import { format } from 'date-fns'

type ValueFormat = 'vnd' | 'usd' | 'points'

interface PriceEntry {
  label: string
  icon: ReactNode
  value: number | null
  updatedAt: string | null
  accentColor: string
  valueFormat?: ValueFormat
  sourceUrl?: string
}

interface Props {
  primary: PriceEntry
  secondary: PriceEntry
  onSync: () => void
  syncing: boolean
}

function formatValue(value: number, fmt: ValueFormat = 'vnd'): string {
  if (fmt === 'usd') return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (fmt === 'points') return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts`
  return formatVND(value)
}

function fmtTime(updatedAt: string | null): string | null {
  if (!updatedAt) return null
  try { return format(new Date(updatedAt), 'dd MMM yyyy, HH:mm') } catch { return updatedAt }
}

function SyncIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`}
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

function PriceSlot({ label, icon, value, updatedAt, accentColor, valueFormat = 'vnd', sourceUrl }: PriceEntry) {
  const time = fmtTime(updatedAt)
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold uppercase tracking-wide hover:underline"
            style={{ color: '#64748B' }}
          >{label}</a>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>{label}</span>
        )}
        <p className="text-xl font-bold tabular-nums leading-tight" style={{ color: value !== null ? '#0F172A' : '#94A3B8' }}>
          {value !== null ? formatValue(value, valueFormat) : '—'}
        </p>
        <p className="text-xs" style={{ color: '#94A3B8' }}>
          {time ? `Updated ${time}` : 'Not synced yet'}
        </p>
      </div>
    </div>
  )
}

export function PricePairWidget({ primary, secondary, onSync, syncing }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-4">
      {/* Card header with single sync button */}
      <div className="flex items-center justify-end">
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
          aria-label="Sync prices"
        >
          <SyncIcon spinning={syncing} />
          {syncing ? 'Syncing…' : 'Sync'}
        </button>
      </div>
      <PriceSlot {...primary} />
      <div className="h-px bg-gray-100" />
      <PriceSlot {...secondary} />
    </div>
  )
}
