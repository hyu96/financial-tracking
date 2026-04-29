import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private jwtService;
    constructor(jwtService: JwtService);
    googleLogin(): void;
    googleCallback(req: any, res: any): void;
    getMe(req: any): {
        id: any;
        email: any;
        displayName: any;
        photoUrl: any;
    };
}
