import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import type { MutualFundHolding, FundNAV } from '../types'

type ApiFundHolding = { id: string; fundName: string; units: number; purchaseNav: number }
type ApiFundNav = { fundName: string; value: number; updatedAt: string }

function toFundHolding(h: ApiFundHolding): MutualFundHolding {
  return { id: h.id, fundName: h.fundName, units: h.units, avgPurchaseNav: h.purchaseNav }
}

function toFundNAV(n: ApiFundNav): FundNAV {
  return { fundName: n.fundName, currentNAV: n.value, updatedAt: n.updatedAt }
}

export function useFundData() {
  return useQuery({
    queryKey: ['funds'],
    queryFn: async () => {
      const [holdings, navs] = await Promise.all([
        api.get<ApiFundHolding[]>('/mutual-funds/holdings'),
        api.get<ApiFundNav[]>('/mutual-funds/navs'),
      ])
      return {
        holdings: (holdings ?? []).map(toFundHolding),
        navs: (navs ?? []).map(toFundNAV),
      }
    },
  })
}
