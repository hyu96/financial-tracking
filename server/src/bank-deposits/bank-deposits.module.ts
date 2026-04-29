import { Module } from '@nestjs/common';
import { BankDepositsController } from './bank-deposits.controller';
import { BankDepositsService } from './bank-deposits.service';

@Module({
  controllers: [BankDepositsController],
  providers: [BankDepositsService],
})
export class BankDepositsModule {}
