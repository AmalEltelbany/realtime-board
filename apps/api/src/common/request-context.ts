import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { CLIENT_ID_HEADER } from '@board/shared';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthedRequest extends Request {
  user: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest<AuthedRequest>().user,
);

/** The tab that made the request; broadcasts carry it so that tab can ignore its own echo. */
export const ClientId = createParamDecorator((_: unknown, ctx: ExecutionContext): string | null => {
  const value = ctx.switchToHttp().getRequest<Request>().header(CLIENT_ID_HEADER);
  return value && value.length <= 64 ? value : null;
});
