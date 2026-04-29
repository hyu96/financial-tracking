"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldModule = void 0;
const common_1 = require("@nestjs/common");
const gold_controller_1 = require("./gold.controller");
const gold_service_1 = require("./gold.service");
const gold_price_fetcher_service_1 = require("./gold-price-fetcher.service");
let GoldModule = class GoldModule {
};
exports.GoldModule = GoldModule;
exports.GoldModule = GoldModule = __decorate([
    (0, common_1.Module)({
        controllers: [gold_controller_1.GoldController],
        providers: [gold_service_1.GoldService, gold_price_fetcher_service_1.GoldPriceFetcherService],
    })
], GoldModule);
//# sourceMappingURL=gold.module.js.map