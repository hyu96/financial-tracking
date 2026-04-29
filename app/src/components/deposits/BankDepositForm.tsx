import { useState, useEffect } from 'react'
import { addMonths, format, parseISO } from 'date-fns'
import type { BankDeposit } from '../../types'

interface Props {
  initial?: BankDeposit
  onSave: (d: Omit<BankDeposit, 'id'>) => void
  onCancel: () => void
}

const TERM_OPTIONS = [1, 3, 6, 9, 12, 18, 24]
const EMPTY = { bankName: '', label: '', principal: '', annualRate: '', startDate: '', termMonths: 12 }

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-shadow'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errCls = 'text-red-500 text-xs mt-1'

function formatPrincipal(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('vi-VN')
}

function deriveMaturityDate(startDate: string, termMonths: number): string {
  if (!startDate) return ''
  try {
    return format(addMonths(parseISO(startDate), termMonths), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export function BankDepositForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState(
    initial
      ? { bankName: initial.bankName, label: initial.label, principal: String(initial.principal), annualRate: String(initial.annualRate), startDate: initial.startDate, termMonths: initial.termMonths }
      : EMPTY
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initial) {
      setForm({ bankName: initial.bankName, label: initial.label, principal: String(initial.principal), annualRate: String(initial.annualRate), startDate: initial.startDate, termMonths: initial.termMonths })
    }
  }, [initial])

  const maturityDate = deriveMaturityDate(form.startDate, form.termMonths)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.bankName.trim()) e.bankName = 'Bank name is required'
    if (!form.principal || isNaN(Number(form.principal)) || Number(form.principal) <= 0) e.principal = 'Enter a positive principal'
    if (!form.annualRate || isNaN(Number(form.annualRate)) || Number(form.annualRate) <= 0) e.annualRate = 'Enter a positive interest rate'
    if (!form.startDate) e.startDate = 'Start date is required'
    if (!form.termMonths) e.termMonths = 'Select a term'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ bankName: form.bankName.trim(), label: form.label.trim(), principal: Number(form.principal), annualRate: Number(form.annualRate), startDate: form.startDate, termMonths: form.termMonths })
  }

  function field(key: keyof typeof form, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls} htmlFor="deposit-bank">Bank name</label>
          <input id="deposit-bank" className={inputCls} value={form.bankName} onChange={(e) => field('bankName', e.target.value)} placeholder="e.g. Techcombank" />
          {errors.bankName && <p className={errCls}>{errors.bankName}</p>}
        </div>
        <div className="flex-1">
          <label className={labelCls} htmlFor="deposit-label">Label <span className="text-gray-300">(optional)</span></label>
          <input id="deposit-label" className={inputCls} value={form.label} onChange={(e) => field('label', e.target.value)} placeholder="e.g. 12-month term" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls} htmlFor="deposit-principal">Principal (₫)</label>
          <input id="deposit-principal" type="text" inputMode="numeric" className={inputCls} value={formatPrincipal(form.principal)} onChange={(e) => field('principal', e.target.value.replace(/\./g, ''))} placeholder="e.g. 100.000.000" />
          {errors.principal && <p className={errCls}>{errors.principal}</p>}
        </div>
        <div className="flex-1">
          <label className={labelCls} htmlFor="deposit-rate">Annual rate (%)</label>
          <input id="deposit-rate" type="number" min="0" step="any" className={inputCls} value={form.annualRate} onChange={(e) => field('annualRate', e.target.value)} placeholder="e.g. 6.5" />
          {errors.annualRate && <p className={errCls}>{errors.annualRate}</p>}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls} htmlFor="deposit-start">Start date</label>
          <input id="deposit-start" type="date" className={inputCls} value={form.startDate} onChange={(e) => field('startDate', e.target.value)} />
          {errors.startDate && <p className={errCls}>{errors.startDate}</p>}
        </div>
        <div className="flex-1">
          <label className={labelCls} htmlFor="deposit-term">Term</label>
          <select id="deposit-term" className={inputCls} value={form.termMonths} onChange={(e) => field('termMonths', Number(e.target.value))}>
            {TERM_OPTIONS.map((m) => (
              <option key={m} value={m}>{m} {m === 1 ? 'month' : 'months'}</option>
            ))}
          </select>
          {errors.termMonths && <p className={errCls}>{errors.termMonths}</p>}
        </div>
      </div>
      {maturityDate && (
        <p className="text-xs text-gray-400">Matures on <span className="font-medium text-gray-600">{maturityDate}</span></p>
      )}
      <div className="flex gap-2 pt-1">
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90" style={{ backgroundColor: '#059669' }}>{initial ? 'Save changes' : 'Add deposit'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
      </div>
    </form>
  )
}
