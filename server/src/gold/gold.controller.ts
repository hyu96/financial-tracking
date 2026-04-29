import { Controller, Get, Post, Patch, Delete, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { GoldService } from './gold.service';
import { GoldPriceFetcherService } from './gold-price-fetcher.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gold')
@UseGuards(JwtAuthGuard)
export class GoldController {
  constructor(
    private goldService: GoldService,
    private fetcher: GoldPriceFetcherService,
  ) {}

  @Get('holdings')
  getHoldings(@Req() req: any) {
    return this.goldService.getHoldings(req.user.id);
  }

  @Post('holdings')
  createHolding(@Req() req: any, @Body() body: any) {
    return this.goldService.createHolding(req.user.id, body);
  }

  @Patch('holdings/:id')
  updateHolding(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.goldService.updateHolding(req.user.id, id, body);
  }

  @Delete('holdings/:id')
  deleteHolding(@Req() req: any, @Param('id') id: string) {
    return this.goldService.deleteHolding(req.user.id, id);
  }

  @Get('price')
  getPrice(@Req() req: any) {
    return this.goldService.getPrice(req.user.id);
  }

  @Put('price')
  upsertPrice(@Req() req: any, @Body() body: any) {
    return this.goldService.upsertPrice(req.user.id, body);
  }

  @Get('market-price')
  getMarketPrice() {
    return this.goldService.getMarketPrice();
  }

  @Post('market-price/sync')
  async syncMarketPrice(@Req() req: any) {
    await this.fetcher.scheduledFetch();
    const market = await this.goldService.getMarketPrice();
    if (market.price !== null) {
      await this.goldService.upsertPrice(req.user.id, {
        value: market.price,
        updatedAt: market.updatedAt!,
      });
    }
    return market;
  }
}
