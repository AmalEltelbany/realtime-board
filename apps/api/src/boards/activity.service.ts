import { Injectable } from '@nestjs/common';
import type { ActivityDto } from '@board/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardEventsService } from '../realtime/board-events.service.js';
import { toActivityDto } from './mappers.js';

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: BoardEventsService,
  ) {}

  async record(boardId: string, actorId: string, summary: string, originClientId: string | null) {
    const activity = await this.prisma.activity.create({
      data: { boardId, actorId, summary },
      include: { actor: true },
    });
    this.events.emit(boardId, originClientId, { type: 'activity', activity: toActivityDto(activity) });
  }

  async recent(boardId: string, limit = 30): Promise<ActivityDto[]> {
    const rows = await this.prisma.activity.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: true },
    });
    return rows.map(toActivityDto);
  }
}
