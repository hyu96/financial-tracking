import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FundNavFetcherService implements OnModuleInit {
  private readonly logger = new Logger(FundNavFetcherService.name);
  private readonly FUND_NAME = 'DCDS';
  private readonly FUND_URL = 'https://fmarket.vn/quy/DCDS';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.scheduledFetch();
  }

  // Daily at 7PM Vietnam time (UTC+7) = 12PM UTC
  @Cron('0 12 * * *')
  async scheduledFetch() {
    this.logger.log(`Fetching NAV for ${this.FUND_NAME}...`);
    const nav = await this.fetchDcdsNav();
    if (nav === null) {
      this.logger.warn(`${this.FUND_NAME} NAV fetch returned null — retaining existing values.`);
      return;
    }

    const holders = await this.prisma.mutualFundHolding.findMany({
      where: { fundName: this.FUND_NAME },
      select: { userId: true },
    });

    if (holders.length === 0) {
      this.logger.log(`NAV fetched (${nav}) but no users hold ${this.FUND_NAME} — skipping upsert.`);
      return;
    }

    const updatedAt = new Date().toISOString();
    await Promise.all(
      holders.map(({ userId }) =>
        this.prisma.fundNav.upsert({
          where: { userId_fundName: { userId, fundName: this.FUND_NAME } },
          create: { userId, fundName: this.FUND_NAME, value: nav, updatedAt },
          update: { value: nav, updatedAt },
        }),
      ),
    );

    this.logger.log(`${this.FUND_NAME} NAV updated to ${nav.toLocaleString()} for ${holders.length} user(s).`);
  }

  async fetchDcdsNav(): Promise<number | null> {
    try {
      const { data: html } = await axios.get<string>(this.FUND_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; financial-tracker/1.0)' },
        timeout: 15000,
      });

      // Target: <span class="nav">100,505.28 VND</span> inside fund__intro fund__nav
      const navMatch = html.match(/class="nav">([\d,]+(?:\.\d+)?)\s*VND/);
      if (navMatch) {
        const val = parseFloat(navMatch[1].replace(/,/g, ''));
        if (!isNaN(val) && val > 0) return val;
      }

      this.logger.warn(`Could not parse price from fmarket.vn response for ${this.FUND_NAME}`);
      return null;
    } catch (err) {
      this.logger.error(`Failed to fetch ${this.FUND_NAME} NAV`, (err as Error).message);
      return null;
    }
  }
}
