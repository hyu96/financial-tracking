export type WeightUnit = 'tael' | 'mace'

export interface GoldHolding {
  id: string
  label: string
  weight: number
  unit: WeightUnit
  purchasePrice: number // VND per unit weight
  purchaseDate: string  // ISO date string
}

export interface GoldPrice {
  value: number       // VND per tael
  updatedAt: string   // ISO datetime string
}

export interface MutualFundHolding {
  id: string
  fundName: string
  units: number
  avgPurchaseNav: number  // VND per unit, weighted average across all purchases
}

export interface FundNAV {
  fundName: string
  currentNAV: number
  updatedAt: string    // ISO datetime string
}

export interface BankDeposit {
  id: string
  bankName: string
  label: string
  principal: number    // VND
  annualRate: number   // percentage, e.g. 6.5 for 6.5%
  startDate: string    // ISO date string
  termMonths: number   // term length in months
}

export interface AppState {
  goldHoldings: GoldHolding[]
  goldPrice: GoldPrice | null
  mutualFundHoldings: MutualFundHolding[]
  fundNAVs: FundNAV[]
  bankDeposits: BankDeposit[]
}

export const INITIAL_STATE: AppState = {
  goldHoldings: [],
  goldPrice: null,
  mutualFundHoldings: [],
  fundNAVs: [],
  bankDeposits: [],
}
