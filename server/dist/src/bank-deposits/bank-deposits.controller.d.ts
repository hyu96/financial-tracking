import { BankDepositsService } from './bank-deposits.service';
export declare class BankDepositsController {
    private bankDepositsService;
    constructor(bankDepositsService: BankDepositsService);
    getDeposits(req: any): import("@prisma/client").Prisma.PrismaPromise<{
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
    createDeposit(req: any, body: any): import("@prisma/client").Prisma.Prisma__BankDepositClient<{
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
    updateDeposit(req: any, id: string, body: any): Promise<{
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
    deleteDeposit(req: any, id: string): Promise<{
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
}
