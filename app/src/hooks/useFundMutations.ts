import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MutualFundHolding, FundNAV } from '../types'
import { api } from '../lib/apiClient'

export function useFundMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['funds'] })

  const addHolding = useMutation({
    mutationFn: (data: Omit<MutualFundHolding, 'id'>) =>
      api.post('/mutual-funds/holdings', { ...data, purchaseNav: data.avgPurchaseNav }),
    onSuccess: invalidate,
  })

  const updateHolding = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<MutualFundHolding, 'id'> }) =>
      api.patch(`/mutual-funds/holdings/${id}`, { ...data, purchaseNav: data.avgPurchaseNav }),
    onSuccess: invalidate,
  })

  const deleteHolding = useMutation({
    mutationFn: (id: string) => api.delete(`/mutual-funds/holdings/${id}`),
    onSuccess: invalidate,
  })

  const saveNAV = useMutation({
    mutationFn: (nav: FundNAV) =>
      api.put(`/mutual-funds/navs/${encodeURIComponent(nav.fundName)}`, {
        value: nav.currentNAV,
        updatedAt: nav.updatedAt,
      }),
    onSuccess: invalidate,
  })

  return { addHolding, updateHolding, deleteHolding, saveNAV }
}
