import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankDepositsService {
  constructor(private prisma: PrismaService) {}

  getDeposits(userId: string) {
    return this.prisma.bankDeposit.findMany({ where: { userId } });
  }

  createDeposit(userId: string, dto: any) {
    return this.prisma.bankDeposit.create({ data: { ...dto, userId } });
  }

  async updateDeposit(userId: string, id: string, dto: any) {
    await this.assertOwns(userId, id);
    return this.prisma.bankDeposit.update({ where: { id }, data: dto });
  }

  async deleteDeposit(userId: string, id: string) {
    await this.assertOwns(userId, id);
    return this.prisma.bankDeposit.delete({ where: { id } });
  }

  private async assertOwns(userId: string, id: string) {
    const d = await this.prisma.bankDeposit.findUnique({ where: { id } });
    if (!d || d.userId !== userId) throw new NotFoundException();
  }
}
