import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function todayVN(): string {
  // Vietnam is UTC+7
  const now = new Date();
  const vnOffset = 7 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnDate = new Date(utc + vnOffset * 60000);
  return vnDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function toTaels(weight: number, unit: string): number {
  return unit === 'mace' ? weight / 10 : weight;
}

function maturityValue(principal: number, annualRate: number, termMonths: number): number {
  return principal + principal * (annualRate / 100) * (termMonths / 12);
}

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  private async computeValues(userId: string) {
    const [goldHoldings, goldPrice, fundHoldings, fundNavs, deposits] = await Promise.all([
      this.prisma.goldHolding.findMany({ where: { userId } }),
      this.prisma.goldPrice.findUnique({ where: { userId } }),
      this.prisma.mutualFundHolding.findMany({ where: { userId } }),
      this.prisma.fundNav.findMany({ where: { userId } }),
      this.prisma.bankDeposit.findMany({ where: { userId } }),
    ]);

    const goldValue = goldHoldings.reduce((sum, h) => {
      const taels = toTaels(h.weight, h.unit);
      return sum + (goldPrice ? taels * goldPrice.value : taels * h.purchasePrice);
    }, 0);

    const fundValue = fundHoldings.reduce((sum, h) => {
      const nav = fundNavs.find((n) => n.fundName === h.fundName);
      return sum + (nav ? h.units * nav.value : h.units * h.purchaseNav);
    }, 0);

    const depositValue = deposits.reduce((sum, d) => {
      return sum + maturityValue(d.principal, d.annualRate, d.termMonths);
    }, 0);

    return { goldValue, fundValue, depositValue, totalValue: goldValue + fundValue + depositValue };
  }

  async upsertTodaySnapshot(userId: string) {
    const date = todayVN();
    const existing = await this.prisma.portfolioSnapshot.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (existing) return existing;

    const values = await this.computeValues(userId);
    return this.prisma.portfolioSnapshot.create({
      data: { userId, date, ...values },
    });
  }

  async getDelta(userId: string) {
    await this.upsertTodaySnapshot(userId);

    const todayDate = todayVN();
    const previous = await this.prisma.portfolioSnapshot.findFirst({
      where: { userId, date: { lt: todayDate } },
      orderBy: { date: 'desc' },
    });

    return {
      previousTotal: previous?.totalValue ?? null,
      previousDate: previous?.date ?? null,
    };
  }
}
