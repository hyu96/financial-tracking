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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var FundNavFetcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundNavFetcherService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
let FundNavFetcherService = FundNavFetcherService_1 = class FundNavFetcherService {
    prisma;
    logger = new common_1.Logger(FundNavFetcherService_1.name);
    FUND_NAME = 'DCDS';
    FUND_URL = 'https://fmarket.vn/quy/DCDS';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.scheduledFetch();
    }
    async scheduledFetch() {
        this.logger.log(`Fetching NAV for ${this.FUND_NAME}...`);
        const nav = await this.fetchDcdsNav();
        if (nav === null) {
            this.logger.warn(`${this.FUND_NAME} NAV fetch returned null — retaining existing values.`);
            return;
        }
        const holders = await this.prisma.mutualFundHolding.findMany({
            where: { fundName: this.FUND_NAME },
            select: { userId: true },
        });
        if (holders.length === 0) {
            this.logger.log(`NAV fetched (${nav}) but no users hold ${this.FUND_NAME} — skipping upsert.`);
            return;
        }
        const updatedAt = new Date().toISOString();
        await Promise.all(holders.map(({ userId }) => this.prisma.fundNav.upsert({
            where: { userId_fundName: { userId, fundName: this.FUND_NAME } },
            create: { userId, fundName: this.FUND_NAME, value: nav, updatedAt },
            update: { value: nav, updatedAt },
        })));
        this.logger.log(`${this.FUND_NAME} NAV updated to ${nav.toLocaleString()} for ${holders.length} user(s).`);
    }
    async fetchDcdsNav() {
        try {
            const { data: html } = await axios_1.default.get(this.FUND_URL, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; financial-tracker/1.0)' },
                timeout: 15000,
            });
            const navMatch = html.match(/class="nav">([\d,]+(?:\.\d+)?)\s*VND/);
            if (navMatch) {
                const val = parseFloat(navMatch[1].replace(/,/g, ''));
                if (!isNaN(val) && val > 0)
                    return val;
            }
            this.logger.warn(`Could not parse price from fmarket.vn response for ${this.FUND_NAME}`);
            return null;
        }
        catch (err) {
            this.logger.error(`Failed to fetch ${this.FUND_NAME} NAV`, err.message);
            return null;
        }
    }
};
exports.FundNavFetcherService = FundNavFetcherService;
__decorate([
    (0, schedule_1.Cron)('0 12 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FundNavFetcherService.prototype, "scheduledFetch", null);
exports.FundNavFetcherService = FundNavFetcherService = FundNavFetcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FundNavFetcherService);
//# sourceMappingURL=fund-nav-fetcher.service.js.map