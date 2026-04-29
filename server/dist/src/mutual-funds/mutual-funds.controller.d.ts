import { MutualFundsService } from './mutual-funds.service';
import { FundNavFetcherService } from './fund-nav-fetcher.service';
export declare class MutualFundsController {
    private mutualFundsService;
    private fetcher;
    constructor(mutualFundsService: MutualFundsService, fetcher: FundNavFetcherService);
    getHoldings(req: any): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }[]>;
    createHolding(req: any, body: any): import("@prisma/client").Prisma.Prisma__MutualFundHoldingClient<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateHolding(req: any, id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }>;
    deleteHolding(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        fundName: string;
        units: number;
        purchaseNav: number;
    }>;
    importReport(req: any, file: Express.Multer.File): Promise<{
        fundName: string;
        units: number;
        avgPurchaseNav: number;
        latestNAV: number;
        lotCount: number;
    }[]>;
    getNavs(req: any): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        userId: string;
        updatedAt: string;
        value: number;
        fundName: string;
    }[]>;
    upsertNav(req: any, fundName: string, body: any): import("@prisma/client").Prisma.Prisma__FundNavClient<{
        id: string;
        userId: string;
        updatedAt: string;
        value: number;
        fundName: string;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    syncNav(): Promise<{
        value: number | null;
        updatedAt: string | null;
    }>;
    getLots(req: any, fundName: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        purchaseDate: string;
        fundName: string;
        units: number;
        purchaseNav: number;
    }[]>;
}
