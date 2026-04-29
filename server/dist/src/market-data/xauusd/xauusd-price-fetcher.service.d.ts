import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export declare class XauUsdPriceFetcherService implements OnModuleInit {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    scheduledFetch(): Promise<void>;
    fetchXauUsd(): Promise<number | null>;
    private fetchFromInvesting;
    private fetchFromYahoo;
}
