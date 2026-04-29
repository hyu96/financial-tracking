import { PrismaService } from '../prisma/prisma.service';
export declare class PortfolioService {
    private prisma;
    constructor(prisma: PrismaService);
    private computeValues;
    upsertTodaySnapshot(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        date: string;
        goldValue: number;
        fundValue: number;
        depositValue: number;
        totalValue: number;
    }>;
    getDelta(userId: string): Promise<{
        previousTotal: number | null;
        previousDate: string | null;
    }>;
}
