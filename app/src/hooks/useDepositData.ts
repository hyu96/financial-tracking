import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import type { BankDeposit } from '../types'

export function useDepositData() {
  return useQuery({
    queryKey: ['deposits'],
    queryFn: async () => {
      const deposits = await api.get<BankDeposit[]>('/bank-deposits')
      return { deposits: deposits ?? [] }
    },
  })
}
