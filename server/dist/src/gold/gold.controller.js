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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldController = void 0;
const common_1 = require("@nestjs/common");
const gold_service_1 = require("./gold.service");
const gold_price_fetcher_service_1 = require("./gold-price-fetcher.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GoldController = class GoldController {
    goldService;
    fetcher;
    constructor(goldService, fetcher) {
        this.goldService = goldService;
        this.fetcher = fetcher;
    }
    getHoldings(req) {
        return this.goldService.getHoldings(req.user.id);
    }
    createHolding(req, body) {
        return this.goldService.createHolding(req.user.id, body);
    }
    updateHolding(req, id, body) {
        return this.goldService.updateHolding(req.user.id, id, body);
    }
    deleteHolding(req, id) {
        return this.goldService.deleteHolding(req.user.id, id);
    }
    getPrice(req) {
        return this.goldService.getPrice(req.user.id);
    }
    upsertPrice(req, body) {
        return this.goldService.upsertPrice(req.user.id, body);
    }
    getMarketPrice() {
        return this.goldService.getMarketPrice();
    }
    async syncMarketPrice(req) {
        await this.fetcher.scheduledFetch();
        const market = await this.goldService.getMarketPrice();
        if (market.price !== null) {
            await this.goldService.upsertPrice(req.user.id, {
                value: market.price,
                updatedAt: market.updatedAt,
            });
        }
        return market;
    }
};
exports.GoldController = GoldController;
__decorate([
    (0, common_1.Get)('holdings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GoldController.prototype, "getHoldings", null);
__decorate([
    (0, common_1.Post)('holdings'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GoldController.prototype, "createHolding", null);
__decorate([
    (0, common_1.Patch)('holdings/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], GoldController.prototype, "updateHolding", null);
__decorate([
    (0, common_1.Delete)('holdings/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GoldController.prototype, "deleteHolding", null);
__decorate([
    (0, common_1.Get)('price'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GoldController.prototype, "getPrice", null);
__decorate([
    (0, common_1.Put)('price'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GoldController.prototype, "upsertPrice", null);
__decorate([
    (0, common_1.Get)('market-price'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GoldController.prototype, "getMarketPrice", null);
__decorate([
    (0, common_1.Post)('market-price/sync'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoldController.prototype, "syncMarketPrice", null);
exports.GoldController = GoldController = __decorate([
    (0, common_1.Controller)('gold'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [gold_service_1.GoldService,
        gold_price_fetcher_service_1.GoldPriceFetcherService])
], GoldController);
//# sourceMappingURL=gold.controller.js.map