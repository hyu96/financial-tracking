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
exports.GoldService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GoldService = class GoldService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getHoldings(userId) {
        return this.prisma.goldHolding.findMany({ where: { userId } });
    }
    createHolding(userId, dto) {
        return this.prisma.goldHolding.create({ data: { ...dto, userId } });
    }
    async updateHolding(userId, id, dto) {
        await this.assertOwns(userId, id);
        return this.prisma.goldHolding.update({ where: { id }, data: dto });
    }
    async deleteHolding(userId, id) {
        await this.assertOwns(userId, id);
        return this.prisma.goldHolding.delete({ where: { id } });
    }
    getPrice(userId) {
        return this.prisma.goldPrice.findUnique({ where: { userId } });
    }
    upsertPrice(userId, dto) {
        return this.prisma.goldPrice.upsert({
            where: { userId },
            create: { userId, ...dto },
            update: dto,
        });
    }
    async getMarketPrice() {
        const row = await this.prisma.systemGoldPrice.findUnique({ where: { id: 'singleton' } });
        if (!row)
            return { price: null, updatedAt: null };
        return { price: row.price, updatedAt: row.updatedAt };
    }
    async assertOwns(userId, id) {
        const h = await this.prisma.goldHolding.findUnique({ where: { id } });
        if (!h || h.userId !== userId)
            throw new common_1.NotFoundException();
    }
};
exports.GoldService = GoldService;
exports.GoldService = GoldService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoldService);
//# sourceMappingURL=gold.service.js.map