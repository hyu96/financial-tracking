import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class FundNavFetcherService implements OnModuleInit {
    private prisma;
    private readonly logger;
    private readonly FUND_NAME;
    private readonly FUND_URL;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    scheduledFetch(): Promise<void>;
    fetchDcdsNav(): Promise<number | null>;
}
