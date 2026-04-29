import { differenceInDays, parseISO, addMonths, format } from 'date-fns'
import type { GoldHolding, GoldPrice, MutualFundHolding, FundNAV, BankDeposit, WeightUnit } from '../types'

// ── Gold ──────────────────────────────────────────────────────────────────────

export function toTaels(weight: number, unit: WeightUnit): number {
  return unit === 'mace' ? weight / 10 : weight
}

export interface GoldHoldingCalc {
  costBasis: number
  currentValue: number | null
  gainLoss: number | null
  gainLossPct: number | null
}

export function calculateGoldValue(holding: GoldHolding, price: GoldPrice | null): GoldHoldingCalc {
  const weightInTaels = toTaels(holding.weight, holding.unit)
  const costBasis = weightInTaels * holding.purchasePrice
  if (!price) return { costBasis, currentValue: null, gainLoss: null, gainLossPct: null }
  const currentValue = weightInTaels * price.value
  const gainLoss = currentValue - costBasis
  const gainLossPct = (gainLoss / costBasis) * 100
  return { costBasis, currentValue, gainLoss, gainLossPct }
}

// ── Mutual Fund ───────────────────────────────────────────────────────────────

export interface FundHoldingCalc {
  costBasis: number
  currentValue: number | null
  gainLoss: number | null
  returnPct: number | null
}

export function calculateFundValue(holding: MutualFundHolding, navs: FundNAV[]): FundHoldingCalc {
  const costBasis = holding.units * holding.avgPurchaseNav
  const nav = navs.find((n) => n.fundName === holding.fundName)
  if (!nav) return { costBasis, currentValue: null, gainLoss: null, returnPct: null }
  const currentValue = holding.units * nav.currentNAV
  const gainLoss = currentValue - costBasis
  const returnPct = ((nav.currentNAV - holding.avgPurchaseNav) / holding.avgPurchaseNav) * 100
  return { costBasis, currentValue, gainLoss, returnPct }
}

// ── Bank Deposit ───────────────────────────────────────────────────────────────

export type DepositStatus = 'Active' | 'Matured'

export interface DepositCalc {
  interest: number          // full term interest (at maturity)
  currentValue: number      // principal only if active; principal + interest if matured
  maturityValue: number
  maturityDate: string
  daysElapsed: number
  daysRemaining: number
  status: DepositStatus
}

export function calculateDepositValue(deposit: BankDeposit, today = new Date()): DepositCalc {
  const start = parseISO(deposit.startDate)
  const maturity = addMonths(start, deposit.termMonths)
  const maturityDate = format(maturity, 'yyyy-MM-dd')
  const totalDays = differenceInDays(maturity, start)
  const elapsed = Math.min(differenceInDays(today, start), totalDays)
  const daysRemaining = Math.max(0, differenceInDays(maturity, today))
  const rate = deposit.annualRate / 100
  const interest = deposit.principal * rate * (deposit.termMonths / 12)
  const maturityValue = deposit.principal + interest
  const status: DepositStatus = today >= maturity ? 'Matured' : 'Active'
  const currentValue = status === 'Matured' ? maturityValue : deposit.principal
  return { interest, currentValue, maturityValue, maturityDate, daysElapsed: elapsed, daysRemaining, status }
}
