import type { AppState, GoldHolding, GoldPrice, MutualFundHolding, FundNAV, BankDeposit } from '../types'
import { INITIAL_STATE } from '../types'
import { migrateLegacyDeposit, migrateLegacyGoldHolding, migrateLegacyGoldPrice, migrateLegacyFundHoldings } from '../utils/io'

const STORAGE_KEY = 'financial-tracker-state'

export function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    return JSON.parse(raw) as AppState
  } catch {
    return INITIAL_STATE
  }
}

export function writeState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// ── Gold ─────────────────────────────────────────────────────────────────────

export function readGoldHoldings(): GoldHolding[] {
  const raw = readState().goldHoldings as unknown as Record<string, unknown>[]
  return raw.map(migrateLegacyGoldHolding)
}

export function writeGoldHoldings(holdings: GoldHolding[]): void {
  writeState({ ...readState(), goldHoldings: holdings })
}

export function readGoldPrice(): GoldPrice | null {
  const raw = readState().goldPrice
  if (!raw) return null
  return migrateLegacyGoldPrice(raw as unknown as Record<string, unknown>)
}

export function writeGoldPrice(price: GoldPrice): void {
  writeState({ ...readState(), goldPrice: price })
}

// ── Mutual Funds ──────────────────────────────────────────────────────────────

export function readFundHoldings(): MutualFundHolding[] {
  const raw = readState().mutualFundHoldings as unknown as Record<string, unknown>[]
  return migrateLegacyFundHoldings(raw)
}

export function writeFundHoldings(holdings: MutualFundHolding[]): void {
  writeState({ ...readState(), mutualFundHoldings: holdings })
}

export function readFundNavs(): FundNAV[] {
  return readState().fundNAVs
}

export function writeFundNavs(navs: FundNAV[]): void {
  writeState({ ...readState(), fundNAVs: navs })
}

// ── Bank Deposits ─────────────────────────────────────────────────────────────

export function readDeposits(): BankDeposit[] {
  const raw = readState().bankDeposits as unknown as Record<string, unknown>[]
  return raw.map(migrateLegacyDeposit)
}

export function writeDeposits(deposits: BankDeposit[]): void {
  writeState({ ...readState(), bankDeposits: deposits })
}
