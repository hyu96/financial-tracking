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
var XauUsdPriceFetcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XauUsdPriceFetcherService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../../prisma/prisma.service");
let XauUsdPriceFetcherService = XauUsdPriceFetcherService_1 = class XauUsdPriceFetcherService {
    prisma;
    logger = new common_1.Logger(XauUsdPriceFetcherService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.scheduledFetch();
    }
    async scheduledFetch() {
        this.logger.log('Fetching XAU/USD price...');
        const price = await this.fetchXauUsd();
        if (price === null) {
            this.logger.warn('XAU/USD fetch returned null — retaining previous price.');
            return;
        }
        await this.prisma.systemXauUsdPrice.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', price, updatedAt: new Date().toISOString(), source: 'investing.com' },
            update: { price, updatedAt: new Date().toISOString() },
        });
        this.logger.log(`XAU/USD price stored: $${price.toFixed(2)}`);
    }
    async fetchXauUsd() {
        const fromInvesting = await this.fetchFromInvesting();
        if (fromInvesting !== null)
            return fromInvesting;
        this.logger.warn('Falling back to Yahoo Finance for XAU/USD...');
        return this.fetchFromYahoo();
    }
    async fetchFromInvesting() {
        try {
            const { data: html } = await axios_1.default.get('https://vn.investing.com/currencies/xau-usd', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
                },
                timeout: 15000,
            });
            const match = html.match(/data-test="instrument-price-last"[^>]*>([^<]+)/);
            if (!match)
                return null;
            const price = parseFloat(match[1].replace(/,/g, ''));
            return isNaN(price) ? null : price;
        }
        catch {
            return null;
        }
    }
    async fetchFromYahoo() {
        try {
            const { data } = await axios_1.default.get('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF', {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                timeout: 10000,
            });
            const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
            return typeof price === 'number' ? price : null;
        }
        catch {
            return null;
        }
    }
};
exports.XauUsdPriceFetcherService = XauUsdPriceFetcherService;
__decorate([
    (0, schedule_1.Cron)('0 2,6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], XauUsdPriceFetcherService.prototype, "scheduledFetch", null);
exports.XauUsdPriceFetcherService = XauUsdPriceFetcherService = XauUsdPriceFetcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], XauUsdPriceFetcherService);
//# sourceMappingURL=xauusd-price-fetcher.service.js.map