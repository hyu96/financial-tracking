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
exports.BankDepositsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BankDepositsService = class BankDepositsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getDeposits(userId) {
        return this.prisma.bankDeposit.findMany({ where: { userId } });
    }
    createDeposit(userId, dto) {
        return this.prisma.bankDeposit.create({ data: { ...dto, userId } });
    }
    async updateDeposit(userId, id, dto) {
        await this.assertOwns(userId, id);
        return this.prisma.bankDeposit.update({ where: { id }, data: dto });
    }
    async deleteDeposit(userId, id) {
        await this.assertOwns(userId, id);
        return this.prisma.bankDeposit.delete({ where: { id } });
    }
    async assertOwns(userId, id) {
        const d = await this.prisma.bankDeposit.findUnique({ where: { id } });
        if (!d || d.userId !== userId)
            throw new common_1.NotFoundException();
    }
};
exports.BankDepositsService = BankDepositsService;
exports.BankDepositsService = BankDepositsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BankDepositsService);
//# sourceMappingURL=bank-deposits.service.js.map