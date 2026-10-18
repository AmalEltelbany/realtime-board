import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';
import { SocketEvents, type BoardEvent, type BoardEventEnvelope } from '@board/shared';

export const boardRoom = (boardId: string) => `board:${boardId}`;

/** Services call this after a successful write; the gateway hands it the Socket.IO server on startup. */
@Injectable()
export class BoardEventsService {
  private readonly logger = new Logger(BoardEventsService.name);
  private server: Server | null = null;

  attach(server: Server) {
    this.server = server;
  }

  emit(boardId: string, originClientId: string | null, event: BoardEvent) {
    if (!this.server) {
      this.logger.warn(`Dropped ${event.type}: socket server not ready`);
      return;
    }
    const envelope: BoardEventEnvelope = { boardId, originClientId, event };
    this.server.to(boardRoom(boardId)).emit(SocketEvents.event, envelope);
  }
}
