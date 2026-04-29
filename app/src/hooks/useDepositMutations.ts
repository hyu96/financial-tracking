import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BankDeposit } from '../types'
import { api } from '../lib/apiClient'

export function useDepositMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['deposits'] })

  const addDeposit = useMutation({
    mutationFn: (data: Omit<BankDeposit, 'id'>) => api.post('/bank-deposits', data),
    onSuccess: invalidate,
  })

  const updateDeposit = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<BankDeposit, 'id'> }) =>
      api.patch(`/bank-deposits/${id}`, data),
    onSuccess: invalidate,
  })

  const deleteDeposit = useMutation({
    mutationFn: (id: string) => api.delete(`/bank-deposits/${id}`),
    onSuccess: invalidate,
  })

  return { addDeposit, updateDeposit, deleteDeposit }
}
