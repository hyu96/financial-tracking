import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export declare class VnIndexPriceFetcherService implements OnModuleInit {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    scheduledFetch(): Promise<void>;
    fetchVnIndex(): Promise<number | null>;
    private fetchFromInvesting;
    private fetchFromYahoo;
}
