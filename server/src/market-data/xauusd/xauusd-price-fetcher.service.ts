import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class XauUsdPriceFetcherService implements OnModuleInit {
  private readonly logger = new Logger(XauUsdPriceFetcherService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.scheduledFetch();
  }

  // 9AM and 1PM Vietnam time (UTC+7) = 2AM and 6AM UTC
  @Cron('0 2,6 * * *')
  async scheduledFetch() {
    this.logger.log('Fetching XAU/USD price...');
    const price = await this.fetchXauUsd();
    if (price === null) {
      this.logger.warn('XAU/USD fetch returned null — retaining previous price.');
      return;
    }
    await this.prisma.systemXauUsdPrice.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', price, updatedAt: new Date().toISOString(), source: 'investing.com' },
      update: { price, updatedAt: new Date().toISOString() },
    });
    this.logger.log(`XAU/USD price stored: $${price.toFixed(2)}`);
  }

  async fetchXauUsd(): Promise<number | null> {
    // Primary: investing.com
    const fromInvesting = await this.fetchFromInvesting();
    if (fromInvesting !== null) return fromInvesting;

    // Fallback: Yahoo Finance gold futures (GC=F) — closely tracks XAU/USD spot
    this.logger.warn('Falling back to Yahoo Finance for XAU/USD...');
    return this.fetchFromYahoo();
  }

  private async fetchFromInvesting(): Promise<number | null> {
    try {
      const { data: html } = await axios.get<string>(
        'https://vn.investing.com/currencies/xau-usd',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
          },
          timeout: 15000,
        },
      );
      const match = html.match(/data-test="instrument-price-last"[^>]*>([^<]+)/);
      if (!match) return null;
      const price = parseFloat(match[1].replace(/,/g, ''));
      return isNaN(price) ? null : price;
    } catch {
      return null;
    }
  }

  private async fetchFromYahoo(): Promise<number | null> {
    try {
      const { data } = await axios.get(
        'https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF',
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 10000,
        },
      );
      const price: number | undefined = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      return typeof price === 'number' ? price : null;
    } catch {
      return null;
    }
  }
}
