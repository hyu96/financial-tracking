import { Module } from '@nestjs/common';
import { GoldController } from './gold.controller';
import { GoldService } from './gold.service';
import { GoldPriceFetcherService } from './gold-price-fetcher.service';

@Module({
  controllers: [GoldController],
  providers: [GoldService, GoldPriceFetcherService],
})
export class GoldModule {}
