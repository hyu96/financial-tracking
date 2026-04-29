import { AllocationService } from './allocation.service';
export declare class AllocationController {
    private allocationService;
    constructor(allocationService: AllocationService);
    getTarget(req: any): import("@prisma/client").Prisma.Prisma__AllocationTargetClient<{
        id: string;
        userId: string;
        goldPct: number;
        fundPct: number;
        depositPct: number;
    } | null, null, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upsertTarget(req: any, body: {
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
