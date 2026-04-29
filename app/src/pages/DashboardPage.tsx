import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PortfolioSummary } from '../components/dashboard/PortfolioSummary'
import { AllocationChart } from '../components/dashboard/AllocationChart'
import { AllocationTable } from '../components/dashboard/AllocationTable'
import { DomainSummaryCard } from '../components/dashboard/DomainSummaryCard'
import { PricePairWidget } from '../components/dashboard/PricePairWidget'
import { useGoldData } from '../hooks/useGoldData'
import { useFundData } from '../hooks/useFundData'
import { useDepositData } from '../hooks/useDepositData'
import { calculateGoldValue, calculateFundValue, calculateDepositValue } from '../utils/calculations'
import { api } from '../lib/apiClient'
import type { AppState } from '../types'

const icons = {
  gold: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  fund: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  deposit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  xauusd: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  vnindex: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
}

export function DashboardPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: goldData, isSuccess: goldLoaded } = useGoldData()
  const { data: fundData, isSuccess: fundLoaded } = useFundData()
  const { data: depositData, isSuccess: depositLoaded } = useDepositData()

  // Daily delta
  const { data: portfolioDelta } = useQuery({
    queryKey: ['portfolio-delta'],
    queryFn: () => api.get<{
      previousTotal: number | null
      previousDate: string | null
    }>('/portfolio/delta'),
  })

  // Live price queries
  const { data: goldMarketPrice } = useQuery({
    queryKey: ['gold-market-price'],
    queryFn: () => api.get<{ price: number | null; updatedAt: string | null }>('/gold/market-price'),
  })

  const { data: xauUsdPrice } = useQuery({
    queryKey: ['xauusd-price'],
    queryFn: () => api.get<{ price: number | null; updatedAt: string | null }>('/market-data/xauusd'),
  })

  const { data: vnIndexPrice } = useQuery({
    queryKey: ['vnindex-price'],
    queryFn: () => api.get<{ price: number | null; updatedAt: string | null }>('/market-data/vnindex'),
  })

  const [syncingGold, setSyncingGold] = useState(false)
  const [syncingFund, setSyncingFund] = useState(false)
  const [syncingXauUsd, setSyncingXauUsd] = useState(false)
  const [syncingVnIndex, setSyncingVnIndex] = useState(false)

  async function handleSyncGold() {
    setSyncingGold(true)
    try {
      await api.post('/gold/market-price/sync', {})
    } catch { /* retain cached value */ } finally {
      await qc.invalidateQueries({ queryKey: ['gold-market-price'] })
      await qc.invalidateQueries({ queryKey: ['gold'] })
      setSyncingGold(false)
    }
  }

  async function handleSyncFund() {
    setSyncingFund(true)
    try {
      await api.post('/mutual-funds/nav/sync', {})
    } catch { /* retain cached value */ } finally {
      await qc.invalidateQueries({ queryKey: ['funds'] })
      setSyncingFund(false)
    }
  }

  async function handleSyncXauUsd() {
    setSyncingXauUsd(true)
    try {
      await api.post('/market-data/xauusd/sync', {})
    } catch { /* retain cached value */ } finally {
      await qc.invalidateQueries({ queryKey: ['xauusd-price'] })
      setSyncingXauUsd(false)
    }
  }

  async function handleSyncVnIndex() {
    setSyncingVnIndex(true)
    try {
      await api.post('/market-data/vnindex/sync', {})
    } catch { /* retain cached value */ } finally {
      await qc.invalidateQueries({ queryKey: ['vnindex-price'] })
      setSyncingVnIndex(false)
    }
  }

  const goldHoldings = goldData?.holdings ?? []
  const goldPrice = goldData?.price ?? null
  const fundHoldings = fundData?.holdings ?? []
  const fundNavs = fundData?.navs ?? []
  const deposits = depositData?.deposits ?? []

  // Aggregates for domain summary cards
  let goldInvested = 0, goldCurrent = 0, goldHasMissing = false
  goldHoldings.forEach((h) => {
    const c = calculateGoldValue(h, goldPrice)
    goldInvested += c.costBasis
    if (c.currentValue !== null) goldCurrent += c.currentValue
    else { goldCurrent += c.costBasis; goldHasMissing = true }
  })

  let fundInvested = 0, fundCurrent = 0, fundHasMissing = false
  fundHoldings.forEach((h) => {
    const c = calculateFundValue(h, fundNavs)
    fundInvested += c.costBasis
    if (c.currentValue !== null) fundCurrent += c.currentValue
    else { fundCurrent += c.costBasis; fundHasMissing = true }
  })

  let depositPrincipal = 0, depositCurrentValue = 0, depositMaturityValue = 0, depositInterest = 0
  deposits.forEach((d) => {
    const c = calculateDepositValue(d)
    depositPrincipal += d.principal
    depositCurrentValue += c.currentValue
    depositMaturityValue += c.maturityValue
    depositInterest += c.interest
  })

  // Reconstruct AppState shape for legacy components that still expect it
  const state: AppState = {
    goldHoldings,
    goldPrice,
    mutualFundHoldings: fundHoldings,
    fundNAVs: fundNavs,
    bankDeposits: deposits,
  }

  // Compute live total (same basis as PortfolioSummary)
  const liveTotal = goldCurrent + fundCurrent + depositMaturityValue
  const previousTotal = portfolioDelta?.previousTotal ?? null
  const dailyDeltaVnd = previousTotal !== null ? liveTotal - previousTotal : null
  const dailyDeltaPct = previousTotal !== null && previousTotal > 0 ? (dailyDeltaVnd! / previousTotal) * 100 : null

  const allLoaded = goldLoaded && fundLoaded && depositLoaded
  const isEmpty = allLoaded && goldHoldings.length === 0 && fundHoldings.length === 0 && deposits.length === 0

  return (
    <div className="space-y-5">
      {isEmpty && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <p className="text-sm font-medium text-yellow-800">Welcome! Your portfolio is empty.</p>
          <p className="text-xs text-yellow-700 mt-1">Start by adding gold holdings, mutual funds, or bank deposits using the tabs above.</p>
        </div>
      )}
      <PortfolioSummary
        state={state}
        dailyDeltaVnd={dailyDeltaVnd}
        dailyDeltaPct={dailyDeltaPct}
      />

      {/* Live price widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PricePairWidget
          primary={{
            label: 'XAU/USD',
            icon: icons.xauusd,
            value: xauUsdPrice?.price ?? null,
            updatedAt: xauUsdPrice?.updatedAt ?? null,
            accentColor: '#D97706',
            valueFormat: 'usd',
            sourceUrl: 'https://vn.investing.com/currencies/xau-usd',
          }}
          secondary={{
            label: 'Gold (BTMC)',
            icon: icons.gold,
            value: goldMarketPrice?.price ?? null,
            updatedAt: goldMarketPrice?.updatedAt ?? null,
            accentColor: '#CA8A04',
            sourceUrl: 'https://btmc.vn',
          }}
          onSync={() => { handleSyncXauUsd(); handleSyncGold() }}
          syncing={syncingXauUsd || syncingGold}
        />
        <PricePairWidget
          primary={{
            label: 'VN-Index',
            icon: icons.vnindex,
            value: vnIndexPrice?.price ?? null,
            updatedAt: vnIndexPrice?.updatedAt ?? null,
            accentColor: '#0891B2',
            valueFormat: 'points',
            sourceUrl: 'https://vn.investing.com/indices/vn',
          }}
          secondary={{
            label: 'DCDS Fund',
            icon: icons.fund,
            value: fundData?.navs.find((n) => n.fundName === 'DCDS')?.currentNAV ?? null,
            updatedAt: fundData?.navs.find((n) => n.fundName === 'DCDS')?.updatedAt ?? null,
            accentColor: '#1E40AF',
            sourceUrl: 'https://fmarket.vn/quy/DCDS',
          }}
          onSync={() => { handleSyncVnIndex(); handleSyncFund() }}
          syncing={syncingVnIndex || syncingFund}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DomainSummaryCard
          label="Gold"
          icon={icons.gold}
          accentColor="#CA8A04"
          totalInvested={goldInvested}
          currentValue={goldHasMissing && goldCurrent === goldInvested ? null : goldCurrent}
          pnlLabel="Gain / Loss"
          pnlValue={goldHasMissing ? null : goldCurrent - goldInvested}
          pnlPct={goldHasMissing || !goldInvested ? null : ((goldCurrent - goldInvested) / goldInvested) * 100}
          isEmpty={goldHoldings.length === 0}
          onNavigate={() => navigate('/gold')}
        />
        <DomainSummaryCard
          label="Mutual Funds"
          icon={icons.fund}
          accentColor="#1E3A8A"
          totalInvested={fundInvested}
          currentValue={fundHasMissing && fundCurrent === fundInvested ? null : fundCurrent}
          pnlLabel="Return"
          pnlValue={fundHasMissing ? null : fundCurrent - fundInvested}
          pnlPct={fundHasMissing || !fundInvested ? null : ((fundCurrent - fundInvested) / fundInvested) * 100}
          isEmpty={fundHoldings.length === 0}
          onNavigate={() => navigate('/funds')}
        />
        <DomainSummaryCard
          label="Bank Deposits"
          icon={icons.deposit}
          accentColor="#059669"
          totalInvested={depositPrincipal}
          currentValue={depositMaturityValue}
          currentValueLabel="Maturity Value"
          pnlLabel="Interest to Earn"
          pnlValue={depositInterest}
          pnlPct={depositPrincipal > 0 ? (depositInterest / depositPrincipal) * 100 : null}
          isEmpty={deposits.length === 0}
          isDeposit
          onNavigate={() => navigate('/deposits')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AllocationChart state={state} />
        <AllocationTable state={state} />
      </div>
    </div>
  )
}
