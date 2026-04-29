import { Module } from '@nestjs/common';
import { XauUsdController } from './xauusd.controller';
import { XauUsdService } from './xauusd.service';
import { XauUsdPriceFetcherService } from './xauusd-price-fetcher.service';

@Module({
  controllers: [XauUsdController],
  providers: [XauUsdService, XauUsdPriceFetcherService],
})
export class XauUsdModule {}
