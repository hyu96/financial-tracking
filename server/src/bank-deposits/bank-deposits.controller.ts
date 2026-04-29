import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BankDepositsService } from './bank-deposits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bank-deposits')
@UseGuards(JwtAuthGuard)
export class BankDepositsController {
  constructor(private bankDepositsService: BankDepositsService) {}

  @Get()
  getDeposits(@Req() req: any) {
    return this.bankDepositsService.getDeposits(req.user.id);
  }

  @Post()
  createDeposit(@Req() req: any, @Body() body: any) {
    return this.bankDepositsService.createDeposit(req.user.id, body);
  }

  @Patch(':id')
  updateDeposit(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.bankDepositsService.updateDeposit(req.user.id, id, body);
  }

  @Delete(':id')
  deleteDeposit(@Req() req: any, @Param('id') id: string) {
    return this.bankDepositsService.deleteDeposit(req.user.id, id);
  }
}
