import { create } from 'zustand'

interface UIState {
  goldEditId: string | null
  goldConfirmId: string | null
  fundEditId: string | null
  fundConfirmId: string | null
  depositEditId: string | null
  depositConfirmId: string | null

  setGoldEditId: (id: string | null) => void
  setGoldConfirmId: (id: string | null) => void
  setFundEditId: (id: string | null) => void
  setFundConfirmId: (id: string | null) => void
  setDepositEditId: (id: string | null) => void
  setDepositConfirmId: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  goldEditId: null,
  goldConfirmId: null,
  fundEditId: null,
  fundConfirmId: null,
  depositEditId: null,
  depositConfirmId: null,

  setGoldEditId: (id) => set({ goldEditId: id }),
  setGoldConfirmId: (id) => set({ goldConfirmId: id }),
  setFundEditId: (id) => set({ fundEditId: id }),
  setFundConfirmId: (id) => set({ fundConfirmId: id }),
  setDepositEditId: (id) => set({ depositEditId: id }),
  setDepositConfirmId: (id) => set({ depositConfirmId: id }),
}))
