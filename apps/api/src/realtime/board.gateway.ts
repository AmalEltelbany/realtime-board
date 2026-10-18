import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { SocketEvents, type PresenceUpdate, type UserDto } from '@board/shared';
import { BoardAccessService } from '../access/board-access.service.js';
import { TokensService } from '../auth/tokens.service.js';
import type { AuthUser } from '../common/request-context.js';
import { BoardEventsService, boardRoom } from './board-events.service.js';

interface SocketData {
  user: AuthUser;
}

type BoardSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>;

@WebSocketGateway()
export class BoardGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(BoardGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly tokens: TokensService,
    private readonly access: BoardAccessService,
    private readonly events: BoardEventsService,
  ) {}

  afterInit(server: Server) {
    this.events.attach(server);
  }

  async handleConnection(client: BoardSocket) {
    const token: unknown = client.handshake.auth?.token;
    try {
      if (typeof token !== 'string') throw new Error('missing token');
      client.data.user = await this.tokens.verify(token, 'socket');
    } catch {
      client.disconnect(true);
      return;
    }

    // Rooms are still populated during "disconnecting", so we know whose presence to refresh.
    client.on('disconnecting', () => {
      const boards = [...client.rooms].filter((room) => room.startsWith('board:'));
      setImmediate(() => boards.forEach((room) => void this.broadcastPresence(room.slice('board:'.length))));
    });
  }

  @SubscribeMessage(SocketEvents.join)
  async join(@ConnectedSocket() client: BoardSocket, @MessageBody() body: { boardId?: unknown }) {
    if (typeof body?.boardId !== 'string') return { ok: false };
    try {
      // Membership is checked on join; a user removed later stops receiving events on their next join.
      await this.access.requireRole(body.boardId, client.data.user.id, 'VIEWER');
    } catch {
      return { ok: false };
    }
    await client.join(boardRoom(body.boardId));
    await this.broadcastPresence(body.boardId);
    return { ok: true };
  }

  @SubscribeMessage(SocketEvents.leave)
  async leave(@ConnectedSocket() client: BoardSocket, @MessageBody() body: { boardId?: unknown }) {
    if (typeof body?.boardId !== 'string') return { ok: false };
    await client.leave(boardRoom(body.boardId));
    await this.broadcastPresence(body.boardId);
    return { ok: true };
  }

  private async broadcastPresence(boardId: string) {
    try {
      const sockets = await this.server.in(boardRoom(boardId)).fetchSockets();
      const users = new Map<string, UserDto>();
      for (const socket of sockets) {
        const user = (socket.data as SocketData).user;
        users.set(user.id, user);
      }
      const update: PresenceUpdate = { boardId, users: [...users.values()] };
      this.server.to(boardRoom(boardId)).emit(SocketEvents.presence, update);
    } catch (error) {
      this.logger.warn(`Presence update failed for ${boardId}: ${String(error)}`);
    }
  }
}
