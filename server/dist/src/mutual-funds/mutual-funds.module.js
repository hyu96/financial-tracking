"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutualFundsModule = void 0;
const common_1 = require("@nestjs/common");
const mutual_funds_controller_1 = require("./mutual-funds.controller");
const mutual_funds_service_1 = require("./mutual-funds.service");
const fund_nav_fetcher_service_1 = require("./fund-nav-fetcher.service");
let MutualFundsModule = class MutualFundsModule {
};
exports.MutualFundsModule = MutualFundsModule;
exports.MutualFundsModule = MutualFundsModule = __decorate([
    (0, common_1.Module)({
        controllers: [mutual_funds_controller_1.MutualFundsController],
        providers: [mutual_funds_service_1.MutualFundsService, fund_nav_fetcher_service_1.FundNavFetcherService],
    })
], MutualFundsModule);
//# sourceMappingURL=mutual-funds.module.js.map