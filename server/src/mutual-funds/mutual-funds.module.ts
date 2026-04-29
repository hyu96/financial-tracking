import { Module } from '@nestjs/common';
import { MutualFundsController } from './mutual-funds.controller';
import { MutualFundsService } from './mutual-funds.service';
import { FundNavFetcherService } from './fund-nav-fetcher.service';

@Module({
  controllers: [MutualFundsController],
  providers: [MutualFundsService, FundNavFetcherService],
})
export class MutualFundsModule {}
