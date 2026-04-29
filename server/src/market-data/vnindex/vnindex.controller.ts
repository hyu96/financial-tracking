import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VnIndexService } from './vnindex.service';
import { VnIndexPriceFetcherService } from './vnindex-price-fetcher.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('market-data/vnindex')
@UseGuards(JwtAuthGuard)
export class VnIndexController {
  constructor(
    private vnIndexService: VnIndexService,
    private fetcher: VnIndexPriceFetcherService,
  ) {}

  @Get()
  getMarketPrice() {
    return this.vnIndexService.getMarketPrice();
  }

  @Post('sync')
  async syncMarketPrice() {
    await this.fetcher.scheduledFetch();
    return this.vnIndexService.getMarketPrice();
  }
}
