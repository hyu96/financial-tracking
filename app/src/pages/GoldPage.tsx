import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { GoldPriceInput } from '../components/gold/GoldPriceInput'
import { GoldHoldingForm } from '../components/gold/GoldHoldingForm'
import { GoldHoldingList } from '../components/gold/GoldHoldingList'
import { useGoldData } from '../hooks/useGoldData'
import { useGoldMutations } from '../hooks/useGoldMutations'
import { SectionCard } from '../components/SectionCard'
import { api } from '../lib/apiClient'

interface MarketPrice {
  price: number | null
  updatedAt: string | null
}

export function GoldPage() {
  const { data } = useGoldData()
  const { addHolding, updateHolding, deleteHolding } = useGoldMutations()
  const [showForm, setShowForm] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const qc = useQueryClient()

  const { data: marketPrice } = useQuery<MarketPrice>({
    queryKey: ['gold-market-price'],
    queryFn: () => api.get<MarketPrice>('/gold/market-price'),
    refetchInterval: 5 * 60 * 1000,
  })

  async function handleSync() {
    setSyncing(true)
    try {
      await api.post('/gold/market-price/sync', {})
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['gold-market-price'] }),
        qc.invalidateQueries({ queryKey: ['gold'] }),
      ])
    } finally {
      setSyncing(false)
    }
  }

  const holdings = data?.holdings ?? []
  const price = data?.price ?? null

  return (
    <div className="space-y-4">
      <GoldPriceInput
        price={price}
        onSync={handleSync}
        syncing={syncing}
        marketPrice={marketPrice?.price ?? null}
        marketPriceUpdatedAt={marketPrice?.updatedAt ?? null}
      />
      <SectionCard
        title="Gold Holdings"
        onAdd={() => setShowForm(true)}
        addLabel="Add holding"
        addColor="#CA8A04"
        showForm={showForm}
      >
        {showForm && (
          <div className="mb-5 pb-5 border-b border-gray-100">
            <GoldHoldingForm onSave={(data) => { addHolding.mutate(data); setShowForm(false) }} onCancel={() => setShowForm(false)} />
          </div>
        )}
        <GoldHoldingList
          holdings={holdings}
          price={price}
          onUpdate={(id, data) => updateHolding.mutate({ id, data })}
          onDelete={(id) => deleteHolding.mutate(id)}
        />
      </SectionCard>
    </div>
  )
}
