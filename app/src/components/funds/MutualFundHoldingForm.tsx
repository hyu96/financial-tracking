import { useState, useEffect } from 'react'
import type { MutualFundHolding } from '../../types'

interface Props {
  initial?: MutualFundHolding
  onSave: (h: Omit<MutualFundHolding, 'id'>) => void
  onCancel: () => void
}

const EMPTY = { fundName: '', units: '', avgPurchaseNav: '' }

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errCls = 'text-red-500 text-xs mt-1'

export function MutualFundHoldingForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, units: String(initial.units), avgPurchaseNav: String(initial.avgPurchaseNav) }
      : EMPTY
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initial) setForm({ ...initial, units: String(initial.units), avgPurchaseNav: String(initial.avgPurchaseNav) })
  }, [initial])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.fundName.trim()) e.fundName = 'Fund name is required'
    if (!form.units || isNaN(Number(form.units)) || Number(form.units) <= 0) e.units = 'Enter a positive number of units'
    if (!form.avgPurchaseNav || isNaN(Number(form.avgPurchaseNav)) || Number(form.avgPurchaseNav) <= 0) e.avgPurchaseNav = 'Enter a positive price'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ fundName: form.fundName.trim(), units: Number(form.units), avgPurchaseNav: Number(form.avgPurchaseNav) })
  }

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="fund-name">Fund name</label>
        <input id="fund-name" className={inputCls} value={form.fundName} onChange={(e) => field('fundName', e.target.value)} placeholder="e.g. DCDS, VFMVF1" disabled={!!initial} />
        {errors.fundName && <p className={errCls}>{errors.fundName}</p>}
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls} htmlFor="fund-units">Units held</label>
          <input id="fund-units" type="number" min="0" step="any" className={inputCls} value={form.units} onChange={(e) => field('units', e.target.value)} />
          {errors.units && <p className={errCls}>{errors.units}</p>}
        </div>
        <div className="flex-1">
          <label className={labelCls} htmlFor="fund-avg-nav">Avg purchase price (₫/unit)</label>
          <input id="fund-avg-nav" type="text" inputMode="numeric" className={inputCls} value={form.avgPurchaseNav ? Number(form.avgPurchaseNav).toLocaleString('vi-VN') : ''} onChange={(e) => field('avgPurchaseNav', e.target.value.replace(/\./g, ''))} placeholder="e.g. 50.000" />
          {errors.avgPurchaseNav && <p className={errCls}>{errors.avgPurchaseNav}</p>}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90" style={{ backgroundColor: '#1E3A8A' }}>{initial ? 'Save changes' : 'Add holding'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
      </div>
    </form>
  )
}
