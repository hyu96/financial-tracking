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
var GoldPriceFetcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldPriceFetcherService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
let GoldPriceFetcherService = GoldPriceFetcherService_1 = class GoldPriceFetcherService {
    prisma;
    logger = new common_1.Logger(GoldPriceFetcherService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.scheduledFetch();
    }
    async scheduledFetch() {
        this.logger.log('Fetching BTMC gold price...');
        const price = await this.fetchBtmcPrice();
        if (price === null) {
            this.logger.warn('BTMC fetch returned null — retaining previous price.');
            return;
        }
        await this.prisma.systemGoldPrice.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', price, updatedAt: new Date().toISOString(), source: 'btmc.vn' },
            update: { price, updatedAt: new Date().toISOString() },
        });
        this.logger.log(`BTMC gold price stored: ${price.toLocaleString()} VND/tael`);
    }
    async fetchBtmcPrice() {
        try {
            const { data: html } = await axios_1.default.get('https://btmc.vn/', {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; financial-tracker/1.0)' },
                timeout: 10000,
            });
            const trMatches = html.match(/<tr[\s\S]*?<\/tr>/gi);
            if (!trMatches) {
                this.logger.warn('No <tr> blocks found in btmc.vn response');
                return null;
            }
            const targetRow = trMatches.find((tr) => tr.includes('VÀNG MIẾNG VRTL'));
            if (!targetRow) {
                this.logger.warn('VÀNG MIẾNG VRTL row not found in btmc.vn response');
                return null;
            }
            const text = targetRow.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            const tokens = text.split(' ');
            let rawValue = null;
            for (let i = tokens.length - 1; i >= 0; i--) {
                const cleaned = tokens[i].replace(/,/g, '');
                const num = parseFloat(cleaned);
                if (!isNaN(num) && num > 0) {
                    rawValue = num;
                    break;
                }
            }
            if (rawValue === null) {
                this.logger.warn('Could not parse numeric sell price from VRTL row');
                return null;
            }
            const pricePerTael = rawValue * 1000 * 10;
            return pricePerTael;
        }
        catch (err) {
            this.logger.error('Failed to fetch BTMC price', err.message);
            return null;
        }
    }
};
exports.GoldPriceFetcherService = GoldPriceFetcherService;
__decorate([
    (0, schedule_1.Cron)('0 2,6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoldPriceFetcherService.prototype, "scheduledFetch", null);
exports.GoldPriceFetcherService = GoldPriceFetcherService = GoldPriceFetcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoldPriceFetcherService);
//# sourceMappingURL=gold-price-fetcher.service.js.map