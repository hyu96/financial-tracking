import { GoldService } from './gold.service';
import { GoldPriceFetcherService } from './gold-price-fetcher.service';
export declare class GoldController {
    private goldService;
    private fetcher;
    constructor(goldService: GoldService, fetcher: GoldPriceFetcherService);
    getHoldings(req: any): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        weight: number;
        unit: string;
        purchasePrice: number;
        purchaseDate: string;
        updatedAt: Date;
    }[]>;
    createHolding(req: any, body: any): import("@prisma/client").Prisma.Prisma__GoldHoldingClient<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        weight: number;
        unit: string;
        purchasePrice: number;
        purchaseDate: string;
        updatedAt: Date;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateHolding(req: any, id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        weight: number;
        unit: string;
        purchasePrice: number;
        purchaseDate: string;
        updatedAt: Date;
    }>;
    deleteHolding(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        weight: number;
        unit: string;
        purchasePrice: number;
        purchaseDate: string;
        updatedAt: Date;
    }>;
    getPrice(req: any): import("@prisma/client").Prisma.Prisma__GoldPriceClient<{
        id: string;
        userId: string;
        updatedAt: string;
        value: number;
    } | null, null, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upsertPrice(req: any, body: any): import("@prisma/client").Prisma.Prisma__GoldPriceClient<{
        id: string;
        userId: string;
        updatedAt: string;
        value: number;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getMarketPrice(): Promise<{
        price: null;
        updatedAt: null;
    } | {
        price: number;
        updatedAt: string;
    }>;
    syncMarketPrice(req: any): Promise<{
        price: null;
        updatedAt: null;
    } | {
        price: number;
        updatedAt: string;
    }>;
}
