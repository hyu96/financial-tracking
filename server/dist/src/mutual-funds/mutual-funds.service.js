"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutualFundsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const XLSX = __importStar(require("xlsx"));
let MutualFundsService = class MutualFundsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getHoldings(userId) {
        return this.prisma.mutualFundHolding.findMany({ where: { userId } });
    }
    createHolding(userId, dto) {
        return this.prisma.mutualFundHolding.create({ data: { ...dto, userId } });
    }
    async updateHolding(userId, id, dto) {
        await this.assertOwns(userId, id);
        return this.prisma.mutualFundHolding.update({ where: { id }, data: dto });
    }
    async deleteHolding(userId, id) {
        await this.assertOwns(userId, id);
        return this.prisma.mutualFundHolding.delete({ where: { id } });
    }
    getNavs(userId) {
        return this.prisma.fundNav.findMany({ where: { userId } });
    }
    upsertNav(userId, fundName, dto) {
        return this.prisma.fundNav.upsert({
            where: { userId_fundName: { userId, fundName } },
            create: { userId, fundName, ...dto },
            update: dto,
        });
    }
    async importFmarketReport(userId, buffer) {
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        const byFund = new Map();
        const lotsByFund = new Map();
        for (const row of rows) {
            if (!Array.isArray(row))
                continue;
            const fundName = typeof row[1] === 'string' ? row[1].trim() : '';
            if (!fundName)
                continue;
            const upper = fundName.toUpperCase();
            if (upper.startsWith('TỔNG') || upper.startsWith('TONG'))
                continue;
            const units = this.parseVND(row[5]);
            if (!isFinite(units) || units <= 0)
                continue;
            const buyPrice = this.parseVND(row[6]);
            const latestNAV = this.parseVND(row[8]);
            const purchaseDate = typeof row[3] === 'string' ? row[3].trim() : String(row[3] ?? '');
            const existing = byFund.get(fundName);
            if (existing) {
                existing.totalUnits += units;
                existing.totalCost += units * buyPrice;
            }
            else {
                byFund.set(fundName, { totalUnits: units, totalCost: units * buyPrice, latestNAV });
            }
            const lots = lotsByFund.get(fundName) ?? [];
            lots.push({ purchaseDate, units, purchaseNav: buyPrice });
            lotsByFund.set(fundName, lots);
        }
        if (byFund.size === 0) {
            throw new common_1.BadRequestException('No fund data found. Make sure this is a valid Fmarket BaoCaoTaiSan report.');
        }
        const results = [];
        for (const [fundName, { totalUnits, totalCost, latestNAV }] of byFund) {
            const avgPurchaseNav = totalUnits > 0 ? totalCost / totalUnits : 0;
            const existing = await this.prisma.mutualFundHolding.findFirst({ where: { userId, fundName } });
            if (existing) {
                await this.prisma.mutualFundHolding.update({ where: { id: existing.id }, data: { units: totalUnits, purchaseNav: avgPurchaseNav } });
            }
            else {
                await this.prisma.mutualFundHolding.create({ data: { userId, fundName, units: totalUnits, purchaseNav: avgPurchaseNav } });
            }
            await this.prisma.fundNav.upsert({
                where: { userId_fundName: { userId, fundName } },
                create: { userId, fundName, value: latestNAV, updatedAt: new Date().toISOString() },
                update: { value: latestNAV, updatedAt: new Date().toISOString() },
            });
            await this.prisma.mutualFundLot.deleteMany({ where: { userId, fundName } });
            const lots = lotsByFund.get(fundName) ?? [];
            await this.prisma.mutualFundLot.createMany({
                data: lots.map((l) => ({ userId, fundName, ...l })),
            });
            results.push({ fundName, units: totalUnits, avgPurchaseNav, latestNAV, lotCount: lots.length });
        }
        return results;
    }
    getLots(userId, fundName) {
        return this.prisma.mutualFundLot.findMany({
            where: { userId, fundName },
            orderBy: { purchaseDate: 'desc' },
        });
    }
    async getLatestDcdsNav() {
        const nav = await this.prisma.fundNav.findFirst({
            where: { fundName: 'DCDS' },
            orderBy: { updatedAt: 'desc' },
        });
        return { value: nav?.value ?? null, updatedAt: nav?.updatedAt ?? null };
    }
    parseVND(val) {
        if (typeof val === 'number')
            return val;
        if (typeof val === 'string')
            return parseFloat(val.replace(/,/g, '')) || 0;
        return 0;
    }
    async assertOwns(userId, id) {
        const h = await this.prisma.mutualFundHolding.findUnique({ where: { id } });
        if (!h || h.userId !== userId)
            throw new common_1.NotFoundException();
    }
};
exports.MutualFundsService = MutualFundsService;
exports.MutualFundsService = MutualFundsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MutualFundsService);
//# sourceMappingURL=mutual-funds.service.js.map