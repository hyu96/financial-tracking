import { PrismaService } from '../prisma/prisma.service';
export declare class BankDepositsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDeposits(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        updatedAt: Date;
        bankName: string;
        principal: number;
        annualRate: number;
        startDate: string;
        termMonths: number;
    }[]>;
    createDeposit(userId: string, dto: any): import("@prisma/client").Prisma.Prisma__BankDepositClient<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        updatedAt: Date;
        bankName: string;
        principal: number;
        annualRate: number;
        startDate: string;
        termMonths: number;
    }, never, import(".prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateDeposit(userId: string, id: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        updatedAt: Date;
        bankName: string;
        principal: number;
        annualRate: number;
        startDate: string;
        termMonths: number;
    }>;
    deleteDeposit(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        label: string;
        updatedAt: Date;
        bankName: string;
        principal: number;
        annualRate: number;
        startDate: string;
        termMonths: number;
    }>;
    private assertOwns;
}
