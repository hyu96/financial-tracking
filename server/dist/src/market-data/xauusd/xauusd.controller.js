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
exports.XauUsdController = void 0;
const common_1 = require("@nestjs/common");
const xauusd_service_1 = require("./xauusd.service");
const xauusd_price_fetcher_service_1 = require("./xauusd-price-fetcher.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let XauUsdController = class XauUsdController {
    xauUsdService;
    fetcher;
    constructor(xauUsdService, fetcher) {
        this.xauUsdService = xauUsdService;
        this.fetcher = fetcher;
    }
    getMarketPrice() {
        return this.xauUsdService.getMarketPrice();
    }
    async syncMarketPrice() {
        await this.fetcher.scheduledFetch();
        return this.xauUsdService.getMarketPrice();
    }
};
exports.XauUsdController = XauUsdController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XauUsdController.prototype, "getMarketPrice", null);
__decorate([
    (0, common_1.Post)('sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], XauUsdController.prototype, "syncMarketPrice", null);
exports.XauUsdController = XauUsdController = __decorate([
    (0, common_1.Controller)('market-data/xauusd'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [xauusd_service_1.XauUsdService,
        xauusd_price_fetcher_service_1.XauUsdPriceFetcherService])
], XauUsdController);
//# sourceMappingURL=xauusd.controller.js.map