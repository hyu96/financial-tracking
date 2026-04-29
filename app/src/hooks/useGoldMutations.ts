import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { GoldHolding, GoldPrice } from '../types'
import { api } from '../lib/apiClient'

export function useGoldMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['gold'] })

  const addHolding = useMutation({
    mutationFn: (data: Omit<GoldHolding, 'id'>) =>
      api.post<GoldHolding>('/gold/holdings', data),
    onSuccess: invalidate,
  })

  const updateHolding = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<GoldHolding, 'id'> }) =>
      api.patch<GoldHolding>(`/gold/holdings/${id}`, data),
    onSuccess: invalidate,
  })

  const deleteHolding = useMutation({
    mutationFn: (id: string) => api.delete(`/gold/holdings/${id}`),
    onSuccess: invalidate,
  })

  const savePrice = useMutation({
    mutationFn: (price: GoldPrice) => api.put('/gold/price', price),
    onSuccess: invalidate,
  })

  return { addHolding, updateHolding, deleteHolding, savePrice }
}
