import { PrismaService } from '../../prisma/prisma.service';
export declare class XauUsdService {
    private prisma;
    constructor(prisma: PrismaService);
    getMarketPrice(): Promise<{
        price: number | null;
        updatedAt: string | null;
    }>;
}
