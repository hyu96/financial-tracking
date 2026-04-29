import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GoogleProfile {
  googleId: string;
  email: string;
  displayName: string;
  photoUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(profile: GoogleProfile) {
    const existing = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });
    if (existing) return existing;

    return this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email: profile.email,
        displayName: profile.displayName,
        photoUrl: profile.photoUrl,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
