import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoldService {
  constructor(private prisma: PrismaService) {}

  getHoldings(userId: string) {
    return this.prisma.goldHolding.findMany({ where: { userId } });
  }

  createHolding(userId: string, dto: any) {
    return this.prisma.goldHolding.create({ data: { ...dto, userId } });
  }

  async updateHolding(userId: string, id: string, dto: any) {
    await this.assertOwns(userId, id);
    return this.prisma.goldHolding.update({ where: { id }, data: dto });
  }

  async deleteHolding(userId: string, id: string) {
    await this.assertOwns(userId, id);
    return this.prisma.goldHolding.delete({ where: { id } });
  }

  getPrice(userId: string) {
    return this.prisma.goldPrice.findUnique({ where: { userId } });
  }

  upsertPrice(userId: string, dto: { value: number; updatedAt: string }) {
    return this.prisma.goldPrice.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  async getMarketPrice() {
    const row = await this.prisma.systemGoldPrice.findUnique({ where: { id: 'singleton' } });
    if (!row) return { price: null, updatedAt: null };
    return { price: row.price, updatedAt: row.updatedAt };
  }

  private async assertOwns(userId: string, id: string) {
    const h = await this.prisma.goldHolding.findUnique({ where: { id } });
    if (!h || h.userId !== userId) throw new NotFoundException();
  }
}
