import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('allocation')
@UseGuards(JwtAuthGuard)
export class AllocationController {
  constructor(private allocationService: AllocationService) {}

  @Get('target')
  getTarget(@Req() req: any) {
    return this.allocationService.getTarget(req.user.id);
  }

  @Put('target')
  upsertTarget(@Req() req: any, @Body() body: { goldPct: number; fundPct: number; depositPct: number }) {
    return this.allocationService.upsertTarget(req.user.id, body);
  }
}
