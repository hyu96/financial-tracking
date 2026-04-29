import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { XauUsdService } from './xauusd.service';
import { XauUsdPriceFetcherService } from './xauusd-price-fetcher.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('market-data/xauusd')
@UseGuards(JwtAuthGuard)
export class XauUsdController {
  constructor(
    private xauUsdService: XauUsdService,
    private fetcher: XauUsdPriceFetcherService,
  ) {}

  @Get()
  getMarketPrice() {
    return this.xauUsdService.getMarketPrice();
  }

  @Post('sync')
  async syncMarketPrice() {
    await this.fetcher.scheduledFetch();
    return this.xauUsdService.getMarketPrice();
  }
}
