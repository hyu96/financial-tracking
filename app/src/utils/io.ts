import { differenceInMonths, parseISO } from 'date-fns'
import type { AppState, BankDeposit, GoldHolding, GoldPrice, MutualFundHolding } from '../types'
import { INITIAL_STATE } from '../types'

const STANDARD_TERMS = [1, 3, 6, 9, 12, 18, 24]

function nearestTerm(months: number): number {
  return STANDARD_TERMS.reduce((prev, curr) =>
    Math.abs(curr - months) < Math.abs(prev - months) ? curr : prev
  )
}

export function migrateLegacyDeposit(record: Record<string, unknown>): BankDeposit {
  // Already migrated — has `termMonths` (no maturityDate)
  if (typeof record.termMonths === 'number' && !('maturityDate' in record)) {
    return record as unknown as BankDeposit
  }

  let termMonths = 12
  if (typeof record.startDate === 'string' && typeof record.maturityDate === 'string') {
    try {
      const diff = differenceInMonths(parseISO(record.maturityDate as string), parseISO(record.startDate as string))
      if (diff >= 1 && diff <= 36) termMonths = nearestTerm(diff)
    } catch {
      // fall back to default 12
    }
  }

  const { maturityDate: _m, ...rest } = record
  return { ...rest, termMonths } as unknown as BankDeposit
}

/**
 * Migrates fund holdings to the position-based model:
 * - Drops `purchaseDate`
 * - Renames `purchaseNAV` → `avgPurchaseNav`
 * - Collapses multiple lots of the same fund into one row (weighted avg)
 */
export function migrateLegacyFundHoldings(records: Record<string, unknown>[]): MutualFundHolding[] {
  // Normalize each record first
  const normalized = records.map((r) => {
    const avgPurchaseNav =
      typeof r.avgPurchaseNav === 'number'
        ? r.avgPurchaseNav
        : typeof r.purchaseNAV === 'number'
          ? r.purchaseNAV
          : 0
    return {
      id: r.id as string,
      fundName: r.fundName as string,
      units: Number(r.units),
      avgPurchaseNav,
    }
  })

  // Collapse multiple lots for the same fund into one position
  const byFund = new Map<string, { id: string; units: number; costBasis: number }>()
  for (const h of normalized) {
    const existing = byFund.get(h.fundName)
    if (existing) {
      existing.costBasis += h.units * h.avgPurchaseNav
      existing.units += h.units
    } else {
      byFund.set(h.fundName, { id: h.id, units: h.units, costBasis: h.units * h.avgPurchaseNav })
    }
  }

  return Array.from(byFund.values()).map(({ id, units, costBasis }) => ({
    id,
    fundName: [...byFund.entries()].find(([, v]) => v.id === id)![0],
    units,
    avgPurchaseNav: units > 0 ? costBasis / units : 0,
  }))
}

export function migrateLegacyGoldHolding(record: Record<string, unknown>): GoldHolding {
  if (record.unit === 'gram') {
    const { unit: _u, weight, ...rest } = record
    return { ...rest, unit: 'mace', weight: Number(weight) / 3.75 } as unknown as GoldHolding
  }
  return record as unknown as GoldHolding
}

export function migrateLegacyGoldPrice(record: Record<string, unknown>): GoldPrice {
  const { unit: _u, ...rest } = record
  return rest as unknown as GoldPrice
}

export function exportToJSON(state: AppState): void {
  const json = JSON.stringify(state, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `financial-tracker-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isValidAppState(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d.goldHoldings) &&
    Array.isArray(d.mutualFundHoldings) &&
    Array.isArray(d.fundNAVs) &&
    Array.isArray(d.bankDeposits) &&
    (d.goldPrice === null || (typeof d.goldPrice === 'object' && d.goldPrice !== null))
  )
}

export function importFromJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!isValidAppState(data)) {
          reject(new Error('Invalid file format: missing required fields.'))
          return
        }
        // Merge with initial state to fill in any missing keys from older exports
        resolve({ ...INITIAL_STATE, ...data })
      } catch {
        reject(new Error('Invalid JSON file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}
