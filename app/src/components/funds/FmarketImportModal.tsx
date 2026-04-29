import type { MutualFundHolding } from '../../types'
import type { FmarketFundRow } from '../../utils/parseFmarketReport'
import { formatVND } from '../../utils/format'

interface Props {
  rows: FmarketFundRow[]
  holdings: MutualFundHolding[]
  onClose: () => void
}

export function FmarketImportModal({ rows, holdings, onClose }: Props) {
  const existingNames = new Set(holdings.map((h) => h.fundName))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Import Complete</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {rows.length} fund{rows.length !== 1 ? 's' : ''} imported successfully.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Fund</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Units</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Avg Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Latest NAV</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const wasReplace = existingNames.has(row.fundName)
                return (
                  <tr key={row.fundName} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{row.fundName}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.units.toLocaleString('vi-VN', { maximumFractionDigits: 4 })}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatVND(Math.round(row.avgPurchaseNav))}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatVND(Math.round(row.latestNAV))}</td>
                    <td className="px-4 py-3 text-center">
                      {wasReplace ? (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600">Updated</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600">Created</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1E3A8A' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
