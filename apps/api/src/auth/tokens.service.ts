import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser } from '../common/request-context.js';

type TokenType = 'session' | 'socket';

interface TokenClaims {
  sub: string;
  email: string;
  name: string;
  typ: TokenType;
}

/**
 * Two token types, signed with the same secret but never interchangeable:
 * - session: lives in an httpOnly cookie on the web app's domain (7 days)
 * - socket: short-lived (60s), used once to open the WebSocket on the API's domain
 */
@Injectable()
export class TokensService {
  constructor(private readonly jwt: JwtService) {}

  sign(user: AuthUser, typ: TokenType): Promise<string> {
    const claims: TokenClaims = { sub: user.id, email: user.email, name: user.name, typ };
    return this.jwt.signAsync(claims, { expiresIn: typ === 'session' ? '7d' : '60s' });
  }

  async verify(token: string, typ: TokenType): Promise<AuthUser> {
    try {
      const claims = await this.jwt.verifyAsync<TokenClaims>(token);
      if (claims.typ !== typ) throw new Error('wrong token type');
      return { id: claims.sub, email: claims.email, name: claims.name };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
