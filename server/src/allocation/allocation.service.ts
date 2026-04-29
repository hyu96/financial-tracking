import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AllocationService {
  constructor(private prisma: PrismaService) {}

  getTarget(userId: string) {
    return this.prisma.allocationTarget.findUnique({ where: { userId } });
  }

  upsertTarget(userId: string, dto: { goldPct: number; fundPct: number; depositPct: number }) {
    const sum = dto.goldPct + dto.fundPct + dto.depositPct;
    if (Math.abs(sum - 100) > 0.01) {
      throw new BadRequestException(`Percentages must sum to 100 (got ${sum})`);
    }
    return this.prisma.allocationTarget.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }
}
