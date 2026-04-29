import { PrismaService } from '../prisma/prisma.service';
export declare class AllocationService {
    private prisma;
    constructor(prisma: PrismaService);
    getTarget(userId: string): import("@prisma/client").Prisma.Prisma__AllocationTargetClient<{
        id: string;
        userId: string;
        goldPct: number;
        fundPct: number;
        depositPct: number;
    } | null, null, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upsertTarget(userId: string, dto: {
        goldPct: number;
        fundPct: number;
        depositPct: number;
    }): import("@prisma/client").Prisma.Prisma__AllocationTargetClient<{
        id: string;
        userId: string;
        goldPct: number;
        fundPct: number;
        depositPct: number;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
