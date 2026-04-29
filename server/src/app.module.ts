import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GoldModule } from './gold/gold.module';
import { MutualFundsModule } from './mutual-funds/mutual-funds.module';
import { BankDepositsModule } from './bank-deposits/bank-deposits.module';
import { AllocationModule } from './allocation/allocation.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { XauUsdModule } from './market-data/xauusd/xauusd.module';
import { VnIndexModule } from './market-data/vnindex/vnindex.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    GoldModule,
    MutualFundsModule,
    BankDepositsModule,
    AllocationModule,
    PortfolioModule,
    XauUsdModule,
    VnIndexModule,
  ],
})
export class AppModule {}
