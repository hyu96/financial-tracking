import { PrismaService } from '../prisma/prisma.service';
export declare class MutualFundsService {
    private prisma;
    constructor(prisma: PrismaService);
    getHoldings(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }[]>;
    createHolding(userId: string, dto: any): import("@prisma/client").Prisma.Prisma__MutualFundHoldingClient<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateHolding(userId: string, id: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }>;
    deleteHolding(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }>;
    getNavs(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        userId: string;
        updatedAt: string;
        value: number;
        fundName: string;
    }[]>;
    upsertNav(userId: string, fundName: string, dto: {
        value: number;
        updatedAt: string;
    }): import("@prisma/client").Prisma.Prisma__FundNavClient<{
        id: string;
        userId: string;
        updatedAt: string;
        value: number;
        fundName: string;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    importFmarketReport(userId: string, buffer: Buffer): Promise<{
        fundName: string;
        units: number;
        avgPurchaseNav: number;
        latestNAV: number;
        lotCount: number;
    }[]>;
    getLots(userId: string, fundName: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        purchaseDate: string;
        fundName: string;
        units: number;
        purchaseNav: number;
    }[]>;
    getLatestDcdsNav(): Promise<{
        value: number | null;
        updatedAt: string | null;
    }>;
    private parseVND;
    private assertOwns;
}
