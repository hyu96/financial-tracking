import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToJSON, importFromJSON, migrateLegacyDeposit, migrateLegacyGoldHolding, migrateLegacyGoldPrice, migrateLegacyFundHoldings } from './io'
import type { AppState } from '../types'
import { INITIAL_STATE } from '../types'

const validState: AppState = {
  ...INITIAL_STATE,
  goldHoldings: [
    { id: '1', label: 'SJC', weight: 1, unit: 'tael', purchasePrice: 8000000, purchaseDate: '2024-01-01' },
  ],
}

describe('exportToJSON', () => {
  it('triggers a download with the correct filename pattern', () => {
    const createObjectURL = vi.fn(() => 'blob:url')
    const revokeObjectURL = vi.fn()
    const click = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const a = { href: '', download: '', click } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(a)

    exportToJSON(validState)

    expect(a.download).toMatch(/^financial-tracker-\d{4}-\d{2}-\d{2}\.json$/)
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:url')
  })
})

describe('importFromJSON', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves with parsed state for a valid JSON file', async () => {
    const json = JSON.stringify(validState)
    const file = new File([json], 'test.json', { type: 'application/json' })
    const result = await importFromJSON(file)
    expect(result.goldHoldings).toHaveLength(1)
    expect(result.goldHoldings[0].label).toBe('SJC')
  })

  it('rejects for a JSON file missing required fields', async () => {
    const bad = JSON.stringify({ foo: 'bar' })
    const file = new File([bad], 'bad.json', { type: 'application/json' })
    await expect(importFromJSON(file)).rejects.toThrow('Invalid file format')
  })

  it('rejects for a non-JSON file', async () => {
    const file = new File(['not json!!!'], 'bad.txt', { type: 'text/plain' })
    await expect(importFromJSON(file)).rejects.toThrow('Invalid JSON file')
  })

  it('merges with INITIAL_STATE to fill missing keys', async () => {
    const partial = JSON.stringify({ ...INITIAL_STATE, goldHoldings: [] })
    const file = new File([partial], 'partial.json', { type: 'application/json' })
    const result = await importFromJSON(file)
    expect(result).toMatchObject(INITIAL_STATE)
  })
})

describe('migrateLegacyDeposit', () => {
  it('derives termMonths from maturityDate and drops maturityDate', () => {
    const legacy = {
      id: 'abc',
      bankName: 'Techcombank',
      label: 'Saving Life 12M',
      principal: 50_000_000,
      annualRate: 5.5,
      startDate: '2024-01-01',
      maturityDate: '2025-01-01',
    }
    const result = migrateLegacyDeposit(legacy)
    expect(result.bankName).toBe('Techcombank')
    expect(result.label).toBe('Saving Life 12M')
    expect(result.termMonths).toBe(12)
    expect(result).not.toHaveProperty('maturityDate')
    expect(result.principal).toBe(50_000_000)
    expect(result.startDate).toBe('2024-01-01')
  })

  it('infers termMonths as nearest standard term', () => {
    // 7-month diff → nearest to [1,3,6,9,12,18,24] is 6
    const legacy = {
      id: 'x',
      bankName: 'VCB',
      label: '',
      principal: 10_000_000,
      annualRate: 4,
      startDate: '2024-01-01',
      maturityDate: '2024-08-01', // 7 months
    }
    const result = migrateLegacyDeposit(legacy)
    expect(result.termMonths).toBe(6)
  })

  it('defaults termMonths to 12 when maturityDate is absent', () => {
    const legacy = { id: 'y', bankName: 'ACB', label: 'test', principal: 1, annualRate: 1, startDate: '2024-01-01' }
    const result = migrateLegacyDeposit(legacy)
    expect(result.termMonths).toBe(12)
  })

  it('passes through already-migrated records unchanged', () => {
    const modern = { id: 'z', bankName: 'VCB', label: '6M', principal: 20_000_000, annualRate: 5, startDate: '2024-01-01', termMonths: 6 }
    const result = migrateLegacyDeposit(modern as unknown as Record<string, unknown>)
    expect(result).toEqual(modern)
  })
})

describe('migrateLegacyGoldHolding', () => {
  it('converts gram holding to mace', () => {
    const legacy = { id: '1', label: 'SJC', weight: 37.5, unit: 'gram', purchasePrice: 3_200_000, purchaseDate: '2023-01-01' }
    const result = migrateLegacyGoldHolding(legacy as unknown as Record<string, unknown>)
    expect(result.unit).toBe('mace')
    expect(result.weight).toBe(10)   // 37.5 / 3.75 = 10 mace = 1 tael
  })

  it('passes through tael holdings unchanged', () => {
    const holding = { id: '2', label: 'PNJ', weight: 2, unit: 'tael', purchasePrice: 100_000_000, purchaseDate: '2023-01-01' }
    const result = migrateLegacyGoldHolding(holding as unknown as Record<string, unknown>)
    expect(result).toEqual(holding)
  })

  it('passes through mace holdings unchanged', () => {
    const holding = { id: '3', label: 'PNJ', weight: 5, unit: 'mace', purchasePrice: 100_000_000, purchaseDate: '2023-01-01' }
    const result = migrateLegacyGoldHolding(holding as unknown as Record<string, unknown>)
    expect(result).toEqual(holding)
  })
})

describe('migrateLegacyFundHoldings', () => {
  it('maps purchaseNAV → avgPurchaseNav and drops purchaseDate', () => {
    const legacy = [{ id: '1', fundName: 'DCDS', units: 100, purchaseNAV: 105_000, purchaseDate: '2024-01-01' }]
    const result = migrateLegacyFundHoldings(legacy as unknown as Record<string, unknown>[])
    expect(result[0].avgPurchaseNav).toBe(105_000)
    expect(result[0].units).toBe(100)
    expect(result[0]).not.toHaveProperty('purchaseDate')
    expect(result[0]).not.toHaveProperty('purchaseNAV')
  })

  it('collapses multiple lots of the same fund into one position with weighted avg', () => {
    const lots = [
      { id: '1', fundName: 'DCDS', units: 200, purchaseNAV: 107_000, purchaseDate: '2024-01-01' },
      { id: '2', fundName: 'DCDS', units: 119, purchaseNAV: 103_985, purchaseDate: '2024-06-01' },
    ]
    const result = migrateLegacyFundHoldings(lots as unknown as Record<string, unknown>[])
    expect(result).toHaveLength(1)
    expect(result[0].units).toBe(319)
    // weighted avg = (200×107000 + 119×103985) / 319
    const expected = (200 * 107_000 + 119 * 103_985) / 319
    expect(result[0].avgPurchaseNav).toBeCloseTo(expected, 0)
  })

  it('passes through already-migrated records (has avgPurchaseNav, no purchaseDate)', () => {
    const modern = [{ id: '1', fundName: 'DCDS', units: 319, avgPurchaseNav: 105_770 }]
    const result = migrateLegacyFundHoldings(modern as unknown as Record<string, unknown>[])
    expect(result).toHaveLength(1)
    expect(result[0].avgPurchaseNav).toBe(105_770)
  })

  it('handles multiple different funds independently', () => {
    const holdings = [
      { id: '1', fundName: 'DCDS', units: 100, purchaseNAV: 100_000 },
      { id: '2', fundName: 'VFMVF1', units: 500, purchaseNAV: 20_000 },
    ]
    const result = migrateLegacyFundHoldings(holdings as unknown as Record<string, unknown>[])
    expect(result).toHaveLength(2)
    expect(result.find((r) => r.fundName === 'DCDS')?.units).toBe(100)
    expect(result.find((r) => r.fundName === 'VFMVF1')?.units).toBe(500)
  })
})

describe('migrateLegacyGoldPrice', () => {
  it('strips unit field and preserves value', () => {
    const legacy = { value: 120_000_000, unit: 'tael', updatedAt: '2024-01-01T00:00:00Z' }
    const result = migrateLegacyGoldPrice(legacy as unknown as Record<string, unknown>)
    expect(result.value).toBe(120_000_000)
    expect(result).not.toHaveProperty('unit')
  })

  it('passes through a price with no unit field unchanged', () => {
    const modern = { value: 120_000_000, updatedAt: '2024-01-01T00:00:00Z' }
    const result = migrateLegacyGoldPrice(modern as unknown as Record<string, unknown>)
    expect(result).toEqual(modern)
  })
})
