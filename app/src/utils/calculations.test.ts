import { describe, it, expect } from 'vitest'
import { calculateDepositValue } from './calculations'
import { toTaels, calculateGoldValue, calculateFundValue } from './calculations'
import type { BankDeposit, GoldHolding, GoldPrice, MutualFundHolding, FundNAV } from '../types'

// ── Bank Deposit ──────────────────────────────────────────────────────────────

const deposit: BankDeposit = {
  id: '1',
  bankName: 'Techcombank',
  label: '12M',
  principal: 100_000_000,
  annualRate: 6,
  startDate: '2024-01-01',
  termMonths: 12,
}

describe('calculateDepositValue', () => {
  it('computes fixed interest using termMonths / 12 formula', () => {
    const calc = calculateDepositValue(deposit)
    // 100,000,000 × 0.06 × (12/12) = 6,000,000
    expect(calc.interest).toBe(6_000_000)
  })

  it('computes maturity value as principal + interest', () => {
    const calc = calculateDepositValue(deposit)
    expect(calc.maturityValue).toBe(106_000_000)
  })

  it('derives maturityDate from startDate + termMonths', () => {
    const calc = calculateDepositValue(deposit)
    expect(calc.maturityDate).toBe('2025-01-01')
  })

  it('interest is the same regardless of when checked (fixed, not accrued)', () => {
    const early = calculateDepositValue(deposit, new Date('2024-03-01'))
    const late = calculateDepositValue(deposit, new Date('2024-11-01'))
    expect(early.interest).toBe(late.interest)
  })

  it('reports Active status before maturity', () => {
    const calc = calculateDepositValue(deposit, new Date('2024-06-01'))
    expect(calc.status).toBe('Active')
    expect(calc.daysRemaining).toBeGreaterThan(0)
  })

  it('reports Matured status on or after maturity date', () => {
    const calc = calculateDepositValue(deposit, new Date('2025-01-01'))
    expect(calc.status).toBe('Matured')
    expect(calc.daysRemaining).toBe(0)
  })

  it('handles a 6-month deposit correctly', () => {
    const sixMonth: BankDeposit = { ...deposit, termMonths: 6 }
    const calc = calculateDepositValue(sixMonth)
    // 100,000,000 × 0.06 × (6/12) = 3,000,000
    expect(calc.interest).toBe(3_000_000)
    expect(calc.maturityDate).toBe('2024-07-01')
  })

  it('accruedInterest is 0 on the start date', () => {
    const calc = calculateDepositValue(deposit, new Date('2024-01-01'))
    expect(calc.accruedInterest).toBe(0)
  })

  it('accruedInterest equals interest at maturity', () => {
    const calc = calculateDepositValue(deposit, new Date('2025-01-01'))
    expect(calc.accruedInterest).toBe(calc.interest)
  })

  it('accruedInterest is approximately half of interest at mid-term', () => {
    // deposit runs 2024-01-01 → 2025-01-01 (366 days), midpoint ~2024-07-02
    const totalDays = 366
    const midDate = new Date('2024-01-01')
    midDate.setDate(midDate.getDate() + Math.floor(totalDays / 2))
    const calc = calculateDepositValue(deposit, midDate)
    expect(calc.accruedInterest).toBeCloseTo(calc.interest / 2, 0)
  })
})

// ── Mutual Fund ───────────────────────────────────────────────────────────────

const fundHolding: MutualFundHolding = { id: '1', fundName: 'DCDS', units: 319, avgPurchaseNav: 105_770 }
const fundNav: FundNAV = { fundName: 'DCDS', currentNAV: 100_505, updatedAt: '2025-01-01T00:00:00Z' }

describe('calculateFundValue', () => {
  it('calculates cost basis from units × avgPurchaseNav', () => {
    const calc = calculateFundValue(fundHolding, [fundNav])
    expect(calc.costBasis).toBeCloseTo(319 * 105_770, 0)
  })

  it('calculates current value from units × currentNAV', () => {
    const calc = calculateFundValue(fundHolding, [fundNav])
    expect(calc.currentValue).toBeCloseTo(319 * 100_505, 0)
  })

  it('calculates gain/loss correctly', () => {
    const calc = calculateFundValue(fundHolding, [fundNav])
    expect(calc.gainLoss).toBeCloseTo(319 * (100_505 - 105_770), 0)
  })

  it('returns null values when NAV is not set', () => {
    const calc = calculateFundValue(fundHolding, [])
    expect(calc.currentValue).toBeNull()
    expect(calc.gainLoss).toBeNull()
    expect(calc.returnPct).toBeNull()
  })
})

// ── Gold ──────────────────────────────────────────────────────────────────────

describe('toTaels', () => {
  it('returns weight unchanged for tael unit', () => {
    expect(toTaels(2, 'tael')).toBe(2)
  })

  it('divides by 10 for mace unit', () => {
    expect(toTaels(10, 'mace')).toBe(1)
    expect(toTaels(5, 'mace')).toBe(0.5)
  })
})

const price: GoldPrice = { value: 120_000_000, updatedAt: '2024-01-01T00:00:00Z' }

describe('calculateGoldValue', () => {
  it('calculates correctly for a tael holding', () => {
    const holding: GoldHolding = { id: '1', label: 'SJC', weight: 2, unit: 'tael', purchasePrice: 100_000_000, purchaseDate: '2023-01-01' }
    const calc = calculateGoldValue(holding, price)
    expect(calc.currentValue).toBe(240_000_000)   // 2 × 120M
    expect(calc.costBasis).toBe(200_000_000)       // 2 × 100M
    expect(calc.gainLoss).toBe(40_000_000)
  })

  it('calculates correctly for a mace holding', () => {
    const holding: GoldHolding = { id: '2', label: 'PNJ', weight: 5, unit: 'mace', purchasePrice: 100_000_000, purchaseDate: '2023-01-01' }
    const calc = calculateGoldValue(holding, price)
    // 5 mace = 0.5 tael
    expect(calc.currentValue).toBe(60_000_000)    // 0.5 × 120M
    expect(calc.costBasis).toBe(50_000_000)        // 0.5 × 100M
    expect(calc.gainLoss).toBe(10_000_000)
  })

  it('returns null values when price is not set', () => {
    const holding: GoldHolding = { id: '3', label: 'SJC', weight: 1, unit: 'tael', purchasePrice: 100_000_000, purchaseDate: '2023-01-01' }
    const calc = calculateGoldValue(holding, null)
    expect(calc.currentValue).toBeNull()
    expect(calc.gainLoss).toBeNull()
  })
})
