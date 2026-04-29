import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { exportToJSON, importFromJSON } from '../../utils/io'
import { readState, writeState } from '../../lib/localStorage'

export function ExportImport() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const qc = useQueryClient()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importFromJSON(file)
      writeState(imported)
      await qc.invalidateQueries()
      setError('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => exportToJSON(readState())}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors duration-150 cursor-pointer"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#CBD5E1' }}
        title="Export portfolio as JSON"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors duration-150 cursor-pointer"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#CBD5E1' }}
        title="Import portfolio from JSON"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import
      </button>
      <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
