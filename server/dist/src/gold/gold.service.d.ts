import { PrismaService } from '../prisma/prisma.service';
export declare class GoldService {
    private prisma;
    constructor(prisma: PrismaService);
    getHoldings(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    createHolding(userId: string, dto: any): import("@prisma/client").Prisma.Prisma__GoldHoldingClient<{
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
    updateHolding(userId: string, id: string, dto: any): Promise<{
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
    deleteHolding(userId: string, id: string): Promise<{
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
    getPrice(userId: string): import("@prisma/client").Prisma.Prisma__GoldPriceClient<{
        id: string;
        userId: string;
        updatedAt: string;
        value: number;
    } | null, null, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upsertPrice(userId: string, dto: {
        value: number;
        updatedAt: string;
    }): import("@prisma/client").Prisma.Prisma__GoldPriceClient<{
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
    private assertOwns;
}
