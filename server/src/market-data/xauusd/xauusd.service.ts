import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class XauUsdService {
  constructor(private prisma: PrismaService) {}

  async getMarketPrice(): Promise<{ price: number | null; updatedAt: string | null }> {
    const record = await this.prisma.systemXauUsdPrice.findUnique({
      where: { id: 'singleton' },
    });
    if (!record) return { price: null, updatedAt: null };
    return { price: record.price, updatedAt: record.updatedAt };
  }
}
