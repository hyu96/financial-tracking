import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private service: PortfolioService) {}

  @Get('delta')
  getDelta(@Request() req: any) {
    return this.service.getDelta(req.user.id);
  }
}
