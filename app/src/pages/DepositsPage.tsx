import { useState } from 'react'
import { BankDepositForm } from '../components/deposits/BankDepositForm'
import { BankDepositList } from '../components/deposits/BankDepositList'
import { useDepositData } from '../hooks/useDepositData'
import { useDepositMutations } from '../hooks/useDepositMutations'
import { SectionCard } from '../components/SectionCard'

export function DepositsPage() {
  const { data } = useDepositData()
  const { addDeposit, updateDeposit, deleteDeposit } = useDepositMutations()
  const [showForm, setShowForm] = useState(false)

  const deposits = data?.deposits ?? []

  return (
    <div className="space-y-4">
      <SectionCard
        title="Bank Deposits"
        onAdd={() => setShowForm(true)}
        addLabel="Add deposit"
        addColor="#059669"
        showForm={showForm}
      >
        {showForm && (
          <div className="mb-5 pb-5 border-b border-gray-100">
            <BankDepositForm onSave={(data) => { addDeposit.mutate(data); setShowForm(false) }} onCancel={() => setShowForm(false)} />
          </div>
        )}
        <BankDepositList
          deposits={deposits}
          onUpdate={(id, data) => updateDeposit.mutate({ id, data })}
          onDelete={(id) => deleteDeposit.mutate(id)}
        />
      </SectionCard>
    </div>
  )
}
