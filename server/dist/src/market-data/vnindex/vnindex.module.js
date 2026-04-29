"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VnIndexModule = void 0;
const common_1 = require("@nestjs/common");
const vnindex_controller_1 = require("./vnindex.controller");
const vnindex_service_1 = require("./vnindex.service");
const vnindex_price_fetcher_service_1 = require("./vnindex-price-fetcher.service");
let VnIndexModule = class VnIndexModule {
};
exports.VnIndexModule = VnIndexModule;
exports.VnIndexModule = VnIndexModule = __decorate([
    (0, common_1.Module)({
        controllers: [vnindex_controller_1.VnIndexController],
        providers: [vnindex_service_1.VnIndexService, vnindex_price_fetcher_service_1.VnIndexPriceFetcherService],
    })
], VnIndexModule);
//# sourceMappingURL=vnindex.module.js.map