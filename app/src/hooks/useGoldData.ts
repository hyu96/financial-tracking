import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import type { GoldHolding, GoldPrice } from '../types'

export function useGoldData() {
  return useQuery({
    queryKey: ['gold'],
    queryFn: async () => {
      const [holdings, price] = await Promise.all([
        api.get<GoldHolding[]>('/gold/holdings'),
        api.get<GoldPrice | null>('/gold/price').catch(() => null),
      ])
      return { holdings: holdings ?? [], price }
    },
  })
}
