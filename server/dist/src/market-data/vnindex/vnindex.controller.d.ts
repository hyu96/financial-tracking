import { VnIndexService } from './vnindex.service';
import { VnIndexPriceFetcherService } from './vnindex-price-fetcher.service';
export declare class VnIndexController {
    private vnIndexService;
    private fetcher;
    constructor(vnIndexService: VnIndexService, fetcher: VnIndexPriceFetcherService);
    getMarketPrice(): Promise<{
        price: number | null;
        updatedAt: string | null;
    }>;
    syncMarketPrice(): Promise<{
        price: number | null;
        updatedAt: string | null;
    }>;
}
