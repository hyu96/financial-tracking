import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoldPriceFetcherService implements OnModuleInit {
  private readonly logger = new Logger(GoldPriceFetcherService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.scheduledFetch();
  }

  // 9AM and 1PM Vietnam time (UTC+7) = 2AM and 6AM UTC
  @Cron('0 2,6 * * *')
  async scheduledFetch() {
    this.logger.log('Fetching BTMC gold price...');
    const price = await this.fetchBtmcPrice();
    if (price === null) {
      this.logger.warn('BTMC fetch returned null — retaining previous price.');
      return;
    }
    await this.prisma.systemGoldPrice.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', price, updatedAt: new Date().toISOString(), source: 'btmc.vn' },
      update: { price, updatedAt: new Date().toISOString() },
    });
    this.logger.log(`BTMC gold price stored: ${price.toLocaleString()} VND/tael`);
  }

  async fetchBtmcPrice(): Promise<number | null> {
    try {
      const { data: html } = await axios.get<string>('https://btmc.vn/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; financial-tracker/1.0)' },
        timeout: 10000,
      });

      // Extract all <tr> blocks
      const trMatches = html.match(/<tr[\s\S]*?<\/tr>/gi);
      if (!trMatches) {
        this.logger.warn('No <tr> blocks found in btmc.vn response');
        return null;
      }

      // Find the row containing VÀNG MIẾNG VRTL
      const targetRow = trMatches.find((tr) => tr.includes('VÀNG MIẾNG VRTL'));
      if (!targetRow) {
        this.logger.warn('VÀNG MIẾNG VRTL row not found in btmc.vn response');
        return null;
      }

      // Strip HTML tags and split by whitespace
      const text = targetRow.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const tokens = text.split(' ');

      // Find the last numeric token (Bán ra / sell price)
      let rawValue: number | null = null;
      for (let i = tokens.length - 1; i >= 0; i--) {
        const cleaned = tokens[i].replace(/,/g, '');
        const num = parseFloat(cleaned);
        if (!isNaN(num) && num > 0) {
          rawValue = num;
          break;
        }
      }

      if (rawValue === null) {
        this.logger.warn('Could not parse numeric sell price from VRTL row');
        return null;
      }

      // raw value (e.g. 17110) × 1,000 (ĐVT) × 10 (mace→tael) = VND per tael
      const pricePerTael = rawValue * 1000 * 10;
      return pricePerTael;
    } catch (err) {
      this.logger.error('Failed to fetch BTMC price', (err as Error).message);
      return null;
    }
  }
}
