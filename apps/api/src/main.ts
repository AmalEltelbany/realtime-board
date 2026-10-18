import { createServer, type Server } from 'node:http';
import { registerHooks } from 'node:module';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
// Nest loads its WebSocket module lazily, by a package subpath that Vercel's file tracer doesn't follow,
// and silently runs without gateways if it's missing. A relative path is always traced.
import '../node_modules/@nestjs/websockets/socket-module.js';
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
  // Point Nest's lazy import at the copy imported above, which is in the bundle. import.meta.resolve
  // returns the real path, so it's the same module instance the gateways' decorators use.
  const socketModule = import.meta.resolve('../node_modules/@nestjs/websockets/socket-module.js');
  registerHooks({
    resolve: (specifier, context, next) =>
      specifier === '@nestjs/websockets/socket-module.js'
        ? { url: socketModule, shortCircuit: true }
        : next(specifier, context),
  });
  const nest = createApp().then(async ({ app }) => {
    await app.init();
    const inner = app.getHttpServer() as Server;
    if (inner.listenerCount('upgrade') === 0) console.warn('No WebSocket upgrade handler is attached.');
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
