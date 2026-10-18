import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { positionBetween, type ListDto } from '@board/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardAccessService } from '../access/board-access.service.js';
import { BoardEventsService } from '../realtime/board-events.service.js';
import { ActivityService } from './activity.service.js';
import { toListDto } from './mappers.js';

@Injectable()
export class ListsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
    private readonly events: BoardEventsService,
    private readonly activity: ActivityService,
  ) {}

  async create(boardId: string, userId: string, title: string, clientId: string | null): Promise<ListDto> {
    await this.access.requireRole(boardId, userId, 'EDITOR');
    const last = await this.prisma.list.findFirst({ where: { boardId }, orderBy: { position: 'desc' } });
    const list = await this.prisma.list.create({
      data: { boardId, title, position: positionBetween(last?.position ?? null, null) },
    });
    return this.publish(boardId, userId, toListDto(list), `added list "${title}"`, clientId);
  }

  async rename(listId: string, userId: string, title: string, clientId: string | null): Promise<ListDto> {
    const list = await this.find(listId);
    await this.access.requireRole(list.boardId, userId, 'EDITOR');
    const updated = await this.prisma.list.update({ where: { id: listId }, data: { title } });
    return this.publish(list.boardId, userId, toListDto(updated), `renamed list to "${title}"`, clientId);
  }

  async move(
    listId: string,
    userId: string,
    afterListId: string | null,
    beforeListId: string | null,
    clientId: string | null,
  ): Promise<ListDto> {
    const list = await this.find(listId);
    await this.access.requireRole(list.boardId, userId, 'EDITOR');
    if (afterListId === listId || beforeListId === listId) throw new BadRequestException('A list cannot be its own neighbour');

    const [after, before] = await Promise.all([
      afterListId ? this.findInBoard(afterListId, list.boardId) : null,
      beforeListId ? this.findInBoard(beforeListId, list.boardId) : null,
    ]);
    const position = safePosition(after?.position ?? null, before?.position ?? null);
    const updated = await this.prisma.list.update({ where: { id: listId }, data: { position } });
    return this.publish(list.boardId, userId, toListDto(updated), `moved list "${list.title}"`, clientId);
  }

  async remove(listId: string, userId: string, clientId: string | null) {
    const list = await this.find(listId);
    await this.access.requireRole(list.boardId, userId, 'EDITOR');
    await this.prisma.list.delete({ where: { id: listId } });
    this.events.emit(list.boardId, clientId, { type: 'list.deleted', listId });
    await this.activity.record(list.boardId, userId, `deleted list "${list.title}"`, clientId);
  }

  private async publish(boardId: string, userId: string, list: ListDto, summary: string, clientId: string | null) {
    await this.prisma.board.update({ where: { id: boardId }, data: { updatedAt: new Date() } });
    this.events.emit(boardId, clientId, { type: 'list.upserted', list });
    await this.activity.record(boardId, userId, summary, clientId);
    return list;
  }

  private async find(listId: string) {
    const list = await this.prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('List not found');
    return list;
  }

  private async findInBoard(listId: string, boardId: string) {
    const list = await this.prisma.list.findUnique({ where: { id: listId } });
    if (!list || list.boardId !== boardId) throw new BadRequestException('Neighbour list is not on this board');
    return list;
  }
}

/** Neighbours come from the client and may be stale; out-of-order neighbours mean "refetch and retry". */
export function safePosition(after: string | null, before: string | null): string {
  try {
    return positionBetween(after, before);
  } catch {
    throw new ConflictException('The board changed while you were moving this. Refresh and try again.');
  }
}
