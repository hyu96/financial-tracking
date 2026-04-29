import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MutualFundTable } from '../components/funds/MutualFundTable'
import { FmarketImportModal } from '../components/funds/FmarketImportModal'
import { useFundData } from '../hooks/useFundData'
import { useFundMutations } from '../hooks/useFundMutations'
import { SectionCard } from '../components/SectionCard'
import type { FmarketFundRow } from '../utils/parseFmarketReport'
import { uploadFile, api } from '../lib/apiClient'

export function FundsPage() {
  const { data } = useFundData()

  const qc = useQueryClient()
  const [syncing, setSyncing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importRows, setImportRows] = useState<FmarketFundRow[] | null>(null)
  const [importError, setImportError] = useState('')

  const holdings = data?.holdings ?? []
  const navs = data?.navs ?? []

  async function handleSync() {
    setSyncing(true)
    try {
      await api.post('/mutual-funds/nav/sync', {})
      await qc.invalidateQueries({ queryKey: ['funds'] })
    } finally {
      setSyncing(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportError('')
    try {
      const rows = await uploadFile<FmarketFundRow[]>('/mutual-funds/import', file)
      await qc.invalidateQueries({ queryKey: ['funds'] })
      setImportRows(rows)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import file.')
    }
  }

  const headerButtons = (
    <>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#1E3A8A' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true">
          <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
        {syncing ? 'Syncing…' : 'Sync Price'}
      </button>
      <input ref={fileInputRef} type="file" accept=".xls,.xlsx" className="hidden" onChange={handleFileChange} />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import from Fmarket
      </button>
    </>
  )

  return (
    <div className="space-y-4">
      <SectionCard title="Mutual Fund Holdings" headerExtra={headerButtons}>
        {importError && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            {importError}
          </div>
        )}
        <MutualFundTable holdings={holdings} navs={navs} />
      </SectionCard>

      {importRows && (
        <FmarketImportModal
          rows={importRows}
          holdings={holdings}
          onClose={() => setImportRows(null)}
        />
      )}
    </div>
  )
}
