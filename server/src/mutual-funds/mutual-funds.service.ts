import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class MutualFundsService {
  constructor(private prisma: PrismaService) {}

  getHoldings(userId: string) {
    return this.prisma.mutualFundHolding.findMany({ where: { userId } });
  }

  createHolding(userId: string, dto: any) {
    return this.prisma.mutualFundHolding.create({ data: { ...dto, userId } });
  }

  async updateHolding(userId: string, id: string, dto: any) {
    await this.assertOwns(userId, id);
    return this.prisma.mutualFundHolding.update({ where: { id }, data: dto });
  }

  async deleteHolding(userId: string, id: string) {
    await this.assertOwns(userId, id);
    return this.prisma.mutualFundHolding.delete({ where: { id } });
  }

  getNavs(userId: string) {
    return this.prisma.fundNav.findMany({ where: { userId } });
  }

  upsertNav(userId: string, fundName: string, dto: { value: number; updatedAt: string }) {
    return this.prisma.fundNav.upsert({
      where: { userId_fundName: { userId, fundName } },
      create: { userId, fundName, ...dto },
      update: dto,
    });
  }

  async importFmarketReport(userId: string, buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });

    const byFund = new Map<string, { totalUnits: number; totalCost: number; latestNAV: number }>();
    const lotsByFund = new Map<string, { purchaseDate: string; units: number; purchaseNav: number }[]>();

    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      const fundName = typeof row[1] === 'string' ? row[1].trim() : '';
      if (!fundName) continue;
      const upper = fundName.toUpperCase();
      if (upper.startsWith('TỔNG') || upper.startsWith('TONG')) continue;
      const units = this.parseVND(row[5]);
      if (!isFinite(units) || units <= 0) continue;
      const buyPrice = this.parseVND(row[6]);
      const latestNAV = this.parseVND(row[8]);
      const purchaseDate = typeof row[3] === 'string' ? row[3].trim() : String(row[3] ?? '');

      const existing = byFund.get(fundName);
      if (existing) {
        existing.totalUnits += units;
        existing.totalCost += units * buyPrice;
      } else {
        byFund.set(fundName, { totalUnits: units, totalCost: units * buyPrice, latestNAV });
      }

      const lots = lotsByFund.get(fundName) ?? [];
      lots.push({ purchaseDate, units, purchaseNav: buyPrice });
      lotsByFund.set(fundName, lots);
    }

    if (byFund.size === 0) {
      throw new BadRequestException('No fund data found. Make sure this is a valid Fmarket BaoCaoTaiSan report.');
    }

    const results: { fundName: string; units: number; avgPurchaseNav: number; latestNAV: number; lotCount: number }[] = [];
    for (const [fundName, { totalUnits, totalCost, latestNAV }] of byFund) {
      const avgPurchaseNav = totalUnits > 0 ? totalCost / totalUnits : 0;
      const existing = await this.prisma.mutualFundHolding.findFirst({ where: { userId, fundName } });
      if (existing) {
        await this.prisma.mutualFundHolding.update({ where: { id: existing.id }, data: { units: totalUnits, purchaseNav: avgPurchaseNav } });
      } else {
        await this.prisma.mutualFundHolding.create({ data: { userId, fundName, units: totalUnits, purchaseNav: avgPurchaseNav } });
      }
      await this.prisma.fundNav.upsert({
        where: { userId_fundName: { userId, fundName } },
        create: { userId, fundName, value: latestNAV, updatedAt: new Date().toISOString() },
        update: { value: latestNAV, updatedAt: new Date().toISOString() },
      });

      // Replace lots: delete existing, insert fresh
      await this.prisma.mutualFundLot.deleteMany({ where: { userId, fundName } });
      const lots = lotsByFund.get(fundName) ?? [];
      await this.prisma.mutualFundLot.createMany({
        data: lots.map((l) => ({ userId, fundName, ...l })),
      });

      results.push({ fundName, units: totalUnits, avgPurchaseNav, latestNAV, lotCount: lots.length });
    }
    return results;
  }

  getLots(userId: string, fundName: string) {
    return this.prisma.mutualFundLot.findMany({
      where: { userId, fundName },
      orderBy: { purchaseDate: 'desc' },
    });
  }

  async getLatestDcdsNav() {
    const nav = await this.prisma.fundNav.findFirst({
      where: { fundName: 'DCDS' },
      orderBy: { updatedAt: 'desc' },
    });
    return { value: nav?.value ?? null, updatedAt: nav?.updatedAt ?? null };
  }

  private parseVND(val: unknown): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0;
    return 0;
  }

  private async assertOwns(userId: string, id: string) {
    const h = await this.prisma.mutualFundHolding.findUnique({ where: { id } });
    if (!h || h.userId !== userId) throw new NotFoundException();
  }
}
