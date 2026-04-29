"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function todayVN() {
    const now = new Date();
    const vnOffset = 7 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const vnDate = new Date(utc + vnOffset * 60000);
    return vnDate.toISOString().slice(0, 10);
}
function toTaels(weight, unit) {
    return unit === 'mace' ? weight / 10 : weight;
}
function maturityValue(principal, annualRate, termMonths) {
    return principal + principal * (annualRate / 100) * (termMonths / 12);
}
let PortfolioService = class PortfolioService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async computeValues(userId) {
        const [goldHoldings, goldPrice, fundHoldings, fundNavs, deposits] = await Promise.all([
            this.prisma.goldHolding.findMany({ where: { userId } }),
            this.prisma.goldPrice.findUnique({ where: { userId } }),
            this.prisma.mutualFundHolding.findMany({ where: { userId } }),
            this.prisma.fundNav.findMany({ where: { userId } }),
            this.prisma.bankDeposit.findMany({ where: { userId } }),
        ]);
        const goldValue = goldHoldings.reduce((sum, h) => {
            const taels = toTaels(h.weight, h.unit);
            return sum + (goldPrice ? taels * goldPrice.value : taels * h.purchasePrice);
        }, 0);
        const fundValue = fundHoldings.reduce((sum, h) => {
            const nav = fundNavs.find((n) => n.fundName === h.fundName);
            return sum + (nav ? h.units * nav.value : h.units * h.purchaseNav);
        }, 0);
        const depositValue = deposits.reduce((sum, d) => {
            return sum + maturityValue(d.principal, d.annualRate, d.termMonths);
        }, 0);
        return { goldValue, fundValue, depositValue, totalValue: goldValue + fundValue + depositValue };
    }
    async upsertTodaySnapshot(userId) {
        const date = todayVN();
        const existing = await this.prisma.portfolioSnapshot.findUnique({
            where: { userId_date: { userId, date } },
        });
        if (existing)
            return existing;
        const values = await this.computeValues(userId);
        return this.prisma.portfolioSnapshot.create({
            data: { userId, date, ...values },
        });
    }
    async getDelta(userId) {
        await this.upsertTodaySnapshot(userId);
        const todayDate = todayVN();
        const previous = await this.prisma.portfolioSnapshot.findFirst({
            where: { userId, date: { lt: todayDate } },
            orderBy: { date: 'desc' },
        });
        return {
            previousTotal: previous?.totalValue ?? null,
            previousDate: previous?.date ?? null,
        };
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map