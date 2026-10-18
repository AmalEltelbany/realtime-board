import { Body, Controller, Get, HttpCode, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput, type UserDto } from '@board/shared';
import { RateLimit } from '../common/rate-limit.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CurrentUser, type AuthUser } from '../common/request-context.js';
import type { Env } from '../config/env.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { SESSION_COOKIE, sessionCookieOptions } from './session-cookie.js';
import { TokensService } from './tokens.service.js';

@Controller('auth')
@RateLimit(10)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokensService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const user = await this.auth.register(body);
    await this.startSession(res, user);
    return user;
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const user = await this.auth.login(body);
    await this.startSession(res, user);
    return user;
  }

  @Post('demo')
  @RateLimit(5)
  async demo(@Res({ passthrough: true }) res: Response): Promise<UserDto> {
    const user = await this.auth.createDemoUser();
    await this.startSession(res, user);
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    const { maxAge: _maxAge, ...options } = sessionCookieOptions(this.isProduction());
    res.clearCookie(SESSION_COOKIE, options);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() current: AuthUser): Promise<UserDto> {
    const user = await this.auth.findById(current.id);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  /** The WebSocket goes straight to the API's domain, where the session cookie isn't sent, so the client trades it for this. */
  @Get('socket-token')
  @UseGuards(AuthGuard)
  async socketToken(@CurrentUser() user: AuthUser): Promise<{ token: string }> {
    return { token: await this.tokens.sign(user, 'socket') };
  }

  private async startSession(res: Response, user: UserDto) {
    res.cookie(SESSION_COOKIE, await this.tokens.sign(user, 'session'), sessionCookieOptions(this.isProduction()));
  }

  private isProduction() {
    return this.config.get('NODE_ENV') === 'production';
  }
}
