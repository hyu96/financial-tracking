import { PrismaService } from '../prisma/prisma.service';
export interface GoogleProfile {
    googleId: string;
    email: string;
    displayName: string;
    photoUrl?: string;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOrCreate(profile: GoogleProfile): Promise<{
        id: string;
        email: string;
        displayName: string;
        photoUrl: string | null;
        googleId: string;
        createdAt: Date;
    }>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        photoUrl: string | null;
        googleId: string;
        createdAt: Date;
    } | null>;
}
