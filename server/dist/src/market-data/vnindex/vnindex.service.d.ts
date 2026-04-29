import { PrismaService } from '../../prisma/prisma.service';
export declare class VnIndexService {
    private prisma;
    constructor(prisma: PrismaService);
    getMarketPrice(): Promise<{
        price: number | null;
        updatedAt: string | null;
    }>;
}
