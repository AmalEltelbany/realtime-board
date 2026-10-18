import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import type { LoginInput, RegisterInput, UserDto } from '@board/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardsService } from '../boards/boards.service.js';

// Compared against when the email doesn't exist, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = argon2.hash('timing-equaliser');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boards: BoardsService,
  ) {}

  async register(input: RegisterInput): Promise<UserDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const user = await this.prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash: await argon2.hash(input.password) },
    });
    return toUserDto(user);
  }

  async login(input: LoginInput): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    const valid = await argon2.verify(user?.passwordHash ?? (await DUMMY_HASH), input.password);
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');
    return toUserDto(user);
  }

  /** "Try the demo": a throwaway account with a sample board, so visitors can test without signing up. */
  async createDemoUser(): Promise<UserDto> {
    const suffix = randomBytes(4).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        email: `demo-${suffix}@demo.realtime-board.dev`,
        name: `Guest ${suffix.slice(0, 4)}`,
        passwordHash: await argon2.hash(randomBytes(24).toString('hex')),
      },
    });
    await this.boards.createSampleBoard(user.id);
    return toUserDto(user);
  }

  async findById(id: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toUserDto(user) : null;
  }
}

export function toUserDto(user: { id: string; email: string; name: string }): UserDto {
  return { id: user.id, email: user.email, name: user.name };
}
