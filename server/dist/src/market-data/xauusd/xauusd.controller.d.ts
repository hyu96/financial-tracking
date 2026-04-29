import { XauUsdService } from './xauusd.service';
import { XauUsdPriceFetcherService } from './xauusd-price-fetcher.service';
export declare class XauUsdController {
    private xauUsdService;
    private fetcher;
    constructor(xauUsdService: XauUsdService, fetcher: XauUsdPriceFetcherService);
    getMarketPrice(): Promise<{
        price: number | null;
        updatedAt: string | null;
    }>;
    syncMarketPrice(): Promise<{
        price: number | null;
        updatedAt: string | null;
    }>;
}
