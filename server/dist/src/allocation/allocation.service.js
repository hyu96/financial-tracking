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
exports.AllocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AllocationService = class AllocationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTarget(userId) {
        return this.prisma.allocationTarget.findUnique({ where: { userId } });
    }
    upsertTarget(userId, dto) {
        const sum = dto.goldPct + dto.fundPct + dto.depositPct;
        if (Math.abs(sum - 100) > 0.01) {
            throw new common_1.BadRequestException(`Percentages must sum to 100 (got ${sum})`);
        }
        return this.prisma.allocationTarget.upsert({
            where: { userId },
            create: { userId, ...dto },
            update: dto,
        });
    }
};
exports.AllocationService = AllocationService;
exports.AllocationService = AllocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AllocationService);
//# sourceMappingURL=allocation.service.js.map