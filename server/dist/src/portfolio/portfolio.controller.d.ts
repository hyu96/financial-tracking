import { PortfolioService } from './portfolio.service';
export declare class PortfolioController {
    private service;
    constructor(service: PortfolioService);
    getDelta(req: any): Promise<{
        previousTotal: number | null;
        previousDate: string | null;
    }>;
}
