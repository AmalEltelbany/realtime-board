import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = configureApp(app);
  await app.listen(config.get('PORT'));
}
// Not a top-level await: Vercel's runtime captures listen() and waits for this module to finish loading first.
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
