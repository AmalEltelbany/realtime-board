import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import type { Env } from './config/env.js';
import { SocketIoAdapter } from './realtime/socket-io.adapter.js';

/** Shared by main.ts and the e2e tests, so tests run the same middleware as production. */
export function configureApp(app: INestApplication) {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  // Behind the web app's proxy (and Render's), so trust X-Forwarded-For for rate limiting.
  (app as NestExpressApplication).set('trust proxy', 1);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new SocketIoAdapter(app, config.get('WEB_ORIGIN')));
  app.enableShutdownHooks();
  return config;
}
