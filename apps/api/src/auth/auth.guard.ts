import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthedRequest } from '../common/request-context.js';
import { SESSION_COOKIE } from './session-cookie.js';
import { TokensService } from './tokens.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokens: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const token: unknown = request.cookies?.[SESSION_COOKIE];
    if (typeof token !== 'string') throw new UnauthorizedException();
    request.user = await this.tokens.verify(token, 'session');
    return true;
  }
}
