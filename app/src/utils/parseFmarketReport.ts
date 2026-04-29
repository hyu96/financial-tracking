import * as XLSX from 'xlsx'

export interface FmarketFundRow {
  fundName: string
  units: number
  avgPurchaseNav: number
  latestNAV: number
}

function parseVNDString(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0
  return 0
}

function isDataRow(row: unknown[]): boolean {
  const fundName = row[1]
  const units = row[5]
  if (typeof fundName !== 'string' || !fundName.trim()) return false
  const upper = fundName.trim().toUpperCase()
  if (upper.startsWith('TỔNG') || upper.startsWith('TONG')) return false
  const unitsNum = typeof units === 'number' ? units : parseFloat(String(units).replace(/,/g, ''))
  return isFinite(unitsNum) && unitsNum > 0
}

export async function parseFmarketReport(file: File): Promise<FmarketFundRow[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })

  const byFund = new Map<string, { totalUnits: number; totalCost: number; latestNAV: number }>()

  for (const row of rows) {
    if (!Array.isArray(row) || !isDataRow(row)) continue

    const fundName = (row[1] as string).trim()
    const units = parseVNDString(row[5])
    const buyPrice = parseVNDString(row[6])
    const latestNAV = parseVNDString(row[8])

    const existing = byFund.get(fundName)
    if (existing) {
      existing.totalUnits += units
      existing.totalCost += units * buyPrice
    } else {
      byFund.set(fundName, { totalUnits: units, totalCost: units * buyPrice, latestNAV })
    }
  }

  if (byFund.size === 0) {
    throw new Error('No fund data found. Make sure this is a valid Fmarket BaoCaoTaiSan report.')
  }

  return Array.from(byFund.entries()).map(([fundName, { totalUnits, totalCost, latestNAV }]) => ({
    fundName,
    units: totalUnits,
    avgPurchaseNav: totalUnits > 0 ? totalCost / totalUnits : 0,
    latestNAV,
  }))
}
