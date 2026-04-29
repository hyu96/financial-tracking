import type { GoldPrice } from '../../types'
import { formatVND } from '../../utils/format'
import { format } from 'date-fns'

interface Props {
  price: GoldPrice | null
  onSync?: () => Promise<void>
  syncing?: boolean
  marketPrice?: number | null
  marketPriceUpdatedAt?: string | null
}

export function GoldPriceInput({ price, onSync, syncing, marketPrice, marketPriceUpdatedAt }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Current Gold Price</p>
            {price ? (
              <>
                <p className="text-lg font-bold whitespace-nowrap" style={{ color: '#CA8A04' }}>{formatVND(price.value)} <span className="text-sm font-normal text-gray-400">/ tael</span></p>
                <p className="text-xs text-gray-400">Updated {format(new Date(price.updatedAt), 'dd MMM yyyy, HH:mm')}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Not set — sync to fetch the live BTMC price</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {marketPrice != null && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-medium text-amber-700 whitespace-nowrap">
                Live BTMC: {formatVND(marketPrice)} / tael
              </span>
              {marketPriceUpdatedAt && (
                <span className="text-xs text-amber-500 hidden sm:inline">
                  {format(new Date(marketPriceUpdatedAt), 'HH:mm')}
                </span>
              )}
            </div>
          )}
          {onSync && (
            <button
              onClick={onSync}
              disabled={syncing}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#CA8A04' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true">
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              {syncing ? 'Syncing…' : 'Sync'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
