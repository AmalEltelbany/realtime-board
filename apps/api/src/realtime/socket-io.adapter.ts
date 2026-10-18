import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/postgres-adapter';
import pg from 'pg';
import type { Server, ServerOptions } from 'socket.io';

/**
 * Socket.IO server with two production concerns:
 * - CORS from runtime config (decorator options are fixed at import time, before env is loaded).
 * - The Postgres adapter: on serverless hosts each request can land on a different instance, so a
 *   broadcast from the instance that saved a card must reach sockets held by the others. The adapter
 *   relays events between instances over Postgres LISTEN/NOTIFY, with no extra service to run.
 */
export class SocketIoAdapter extends IoAdapter {
  private readonly pool: pg.Pool;

  constructor(
    app: INestApplicationContext,
    private readonly webOrigin: string,
    databaseUrl: string,
  ) {
    super(app);
    // LISTEN needs a session, so this must be a direct (not transaction-pooled) connection.
    this.pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, { ...options, cors: { origin: this.webOrigin } } as ServerOptions);
    server.adapter(createAdapter(this.pool));
    return server;
  }

  override async close(server: Server) {
    await super.close(server);
    await this.pool.end();
  }
}
