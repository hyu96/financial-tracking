import { Module } from '@nestjs/common';
import { VnIndexController } from './vnindex.controller';
import { VnIndexService } from './vnindex.service';
import { VnIndexPriceFetcherService } from './vnindex-price-fetcher.service';

@Module({
  controllers: [VnIndexController],
  providers: [VnIndexService, VnIndexPriceFetcherService],
})
export class VnIndexModule {}
