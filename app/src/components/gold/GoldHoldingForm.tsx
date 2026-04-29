import { useState, useEffect } from 'react'
import type { GoldHolding, WeightUnit } from '../../types'

interface Props {
  initial?: GoldHolding
  onSave: (holding: Omit<GoldHolding, 'id'>) => void
  onCancel: () => void
}

const EMPTY = { label: '', weight: '', unit: 'tael' as WeightUnit, purchasePrice: '', purchaseDate: '' }

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errCls = 'text-red-500 text-xs mt-1'

export function GoldHoldingForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState(
    initial ? { ...initial, weight: String(initial.weight), purchasePrice: String(initial.purchasePrice) } : EMPTY
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initial) setForm({ ...initial, weight: String(initial.weight), purchasePrice: String(initial.purchasePrice) })
  }, [initial])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.label.trim()) e.label = 'Label is required'
    if (!form.weight || isNaN(Number(form.weight)) || Number(form.weight) <= 0) e.weight = 'Enter a positive weight'
    if (!form.purchasePrice || isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) <= 0) e.purchasePrice = 'Enter a positive price'
    if (!form.purchaseDate) e.purchaseDate = 'Purchase date is required'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ label: form.label.trim(), weight: Number(form.weight), unit: form.unit, purchasePrice: Number(form.purchasePrice), purchaseDate: form.purchaseDate })
  }

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="gold-label">Label</label>
        <input id="gold-label" className={inputCls} value={form.label} onChange={(e) => field('label', e.target.value)} placeholder="e.g. SJC 1 tael" />
        {errors.label && <p className={errCls}>{errors.label}</p>}
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls} htmlFor="gold-weight">Weight</label>
          <input id="gold-weight" type="number" min="0" step="any" className={inputCls} value={form.weight} onChange={(e) => field('weight', e.target.value)} />
          {errors.weight && <p className={errCls}>{errors.weight}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="gold-unit">Unit</label>
          <select id="gold-unit" className="border border-gray-200 rounded-lg px-3 py-2 text-sm h-[38px] cursor-pointer focus:outline-none" value={form.unit} onChange={(e) => field('unit', e.target.value as WeightUnit)}>
            <option value="tael">Tael</option>
            <option value="mace">Mace</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="gold-price">Purchase price (₫ per {form.unit})</label>
        <input id="gold-price" type="text" inputMode="numeric" className={inputCls} value={form.purchasePrice ? Number(form.purchasePrice).toLocaleString('vi-VN') : ''} onChange={(e) => field('purchasePrice', e.target.value.replace(/\./g, ''))} placeholder="e.g. 171.100.000" />
        {errors.purchasePrice && <p className={errCls}>{errors.purchasePrice}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor="gold-date">Purchase date</label>
        <input id="gold-date" type="date" className={inputCls} value={form.purchaseDate} onChange={(e) => field('purchaseDate', e.target.value)} />
        {errors.purchaseDate && <p className={errCls}>{errors.purchaseDate}</p>}
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90" style={{ backgroundColor: '#CA8A04' }}>{initial ? 'Save changes' : 'Add holding'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
      </div>
    </form>
  )
}
