import { createServer, type Server } from 'node:http';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { createRequire } from 'node:module';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';

async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  return { app, config: configureApp(app) };
}

/**
 * On Vercel, the function's entry exports an http.Server and Vercel delivers both requests and
 * WebSocket upgrades to it. Nest builds its own server asynchronously, so we export a server that
 * exists immediately and forwards each event to Nest's once it's ready (Express and Socket.IO
 * are both attached to Nest's server).
 */
function vercelServer(): Server {
  const nest = createApp().then(async ({ app }) => {
    // TEMP diagnostic: can @nestjs/core resolve its optional WebSocket module here?
    try {
      const fromCore = createRequire(import.meta.resolve('@nestjs/core'));
      console.warn('ws-diag resolve', fromCore.resolve('@nestjs/websockets/socket-module'));
      await import(fromCore.resolve('@nestjs/websockets/socket-module'));
      console.warn('ws-diag import ok');
    } catch (error) {
      console.warn('ws-diag failed', String(error));
    }
    await app.init();
    const inner = app.getHttpServer() as Server;
    console.warn('ws-diag upgrade listeners', inner.listenerCount('upgrade'));
    return inner;
  });
  nest.catch((error: unknown) => console.error('API failed to start', error));
  const server = createServer();
  server.on('request', (req, res) => {
    nest.then(
      (inner) => inner.emit('request', req, res),
      () => res.writeHead(503).end(),
    );
  });
  server.on('upgrade', (req, socket, head) => {
    nest.then(
      (inner) => inner.emit('upgrade', req, socket, head),
      () => socket.destroy(),
    );
  });
  return server;
}

async function listen() {
  const { app, config } = await createApp();
  await app.listen(config.get('PORT'));
}

export default process.env.VERCEL ? vercelServer() : undefined;

if (!process.env.VERCEL) {
  // Not a top-level await, so the module finishes loading before the server starts.
  listen().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
