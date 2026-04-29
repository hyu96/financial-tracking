import { Controller, Get, Post, Patch, Delete, Put, Body, Param, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MutualFundsService } from './mutual-funds.service';
import { FundNavFetcherService } from './fund-nav-fetcher.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mutual-funds')
@UseGuards(JwtAuthGuard)
export class MutualFundsController {
  constructor(
    private mutualFundsService: MutualFundsService,
    private fetcher: FundNavFetcherService,
  ) {}

  @Get('holdings')
  getHoldings(@Req() req: any) {
    return this.mutualFundsService.getHoldings(req.user.id);
  }

  @Post('holdings')
  createHolding(@Req() req: any, @Body() body: any) {
    return this.mutualFundsService.createHolding(req.user.id, body);
  }

  @Patch('holdings/:id')
  updateHolding(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.mutualFundsService.updateHolding(req.user.id, id, body);
  }

  @Delete('holdings/:id')
  deleteHolding(@Req() req: any, @Param('id') id: string) {
    return this.mutualFundsService.deleteHolding(req.user.id, id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importReport(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.mutualFundsService.importFmarketReport(req.user.id, file.buffer);
  }

  @Get('navs')
  getNavs(@Req() req: any) {
    return this.mutualFundsService.getNavs(req.user.id);
  }

  @Put('navs/:fundName')
  upsertNav(@Req() req: any, @Param('fundName') fundName: string, @Body() body: any) {
    return this.mutualFundsService.upsertNav(req.user.id, fundName, body);
  }

  @Post('nav/sync')
  async syncNav() {
    await this.fetcher.scheduledFetch();
    return this.mutualFundsService.getLatestDcdsNav();
  }

  @Get('lots/:fundName')
  getLots(@Req() req: any, @Param('fundName') fundName: string) {
    return this.mutualFundsService.getLots(req.user.id, fundName);
  }
}
