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
exports.MutualFundsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const mutual_funds_service_1 = require("./mutual-funds.service");
const fund_nav_fetcher_service_1 = require("./fund-nav-fetcher.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MutualFundsController = class MutualFundsController {
    mutualFundsService;
    fetcher;
    constructor(mutualFundsService, fetcher) {
        this.mutualFundsService = mutualFundsService;
        this.fetcher = fetcher;
    }
    getHoldings(req) {
        return this.mutualFundsService.getHoldings(req.user.id);
    }
    createHolding(req, body) {
        return this.mutualFundsService.createHolding(req.user.id, body);
    }
    updateHolding(req, id, body) {
        return this.mutualFundsService.updateHolding(req.user.id, id, body);
    }
    deleteHolding(req, id) {
        return this.mutualFundsService.deleteHolding(req.user.id, id);
    }
    importReport(req, file) {
        return this.mutualFundsService.importFmarketReport(req.user.id, file.buffer);
    }
    getNavs(req) {
        return this.mutualFundsService.getNavs(req.user.id);
    }
    upsertNav(req, fundName, body) {
        return this.mutualFundsService.upsertNav(req.user.id, fundName, body);
    }
    async syncNav() {
        await this.fetcher.scheduledFetch();
        return this.mutualFundsService.getLatestDcdsNav();
    }
    getLots(req, fundName) {
        return this.mutualFundsService.getLots(req.user.id, fundName);
    }
};
exports.MutualFundsController = MutualFundsController;
__decorate([
    (0, common_1.Get)('holdings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "getHoldings", null);
__decorate([
    (0, common_1.Post)('holdings'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "createHolding", null);
__decorate([
    (0, common_1.Patch)('holdings/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "updateHolding", null);
__decorate([
    (0, common_1.Delete)('holdings/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "deleteHolding", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "importReport", null);
__decorate([
    (0, common_1.Get)('navs'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "getNavs", null);
__decorate([
    (0, common_1.Put)('navs/:fundName'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('fundName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "upsertNav", null);
__decorate([
    (0, common_1.Post)('nav/sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MutualFundsController.prototype, "syncNav", null);
__decorate([
    (0, common_1.Get)('lots/:fundName'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('fundName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MutualFundsController.prototype, "getLots", null);
exports.MutualFundsController = MutualFundsController = __decorate([
    (0, common_1.Controller)('mutual-funds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mutual_funds_service_1.MutualFundsService,
        fund_nav_fetcher_service_1.FundNavFetcherService])
], MutualFundsController);
//# sourceMappingURL=mutual-funds.controller.js.map