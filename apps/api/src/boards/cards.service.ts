import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { positionBetween, type CardDto, type MoveCardInput } from '@board/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardAccessService } from '../access/board-access.service.js';
import { BoardEventsService } from '../realtime/board-events.service.js';
import { ActivityService } from './activity.service.js';
import { safePosition } from './lists.service.js';
import { toCardDto } from './mappers.js';

@Injectable()
export class CardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
    private readonly events: BoardEventsService,
    private readonly activity: ActivityService,
  ) {}

  async create(listId: string, userId: string, title: string, clientId: string | null): Promise<CardDto> {
    const list = await this.prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('List not found');
    await this.access.requireRole(list.boardId, userId, 'EDITOR');

    const last = await this.prisma.card.findFirst({ where: { listId }, orderBy: { position: 'desc' } });
    const card = await this.prisma.card.create({
      data: { boardId: list.boardId, listId, title, position: positionBetween(last?.position ?? null, null) },
    });
    return this.publish(card.boardId, userId, toCardDto(card), `added "${title}" to ${list.title}`, clientId);
  }

  async update(
    cardId: string,
    userId: string,
    patch: { title?: string; description?: string; version: number },
    clientId: string | null,
  ): Promise<CardDto> {
    const card = await this.find(cardId);
    await this.access.requireRole(card.boardId, userId, 'EDITOR');
    const updated = await this.writeIfCurrent(cardId, patch.version, {
      title: patch.title,
      description: patch.description,
    });
    return this.publish(card.boardId, userId, updated, `edited "${updated.title}"`, clientId);
  }

  async move(cardId: string, userId: string, input: MoveCardInput, clientId: string | null): Promise<CardDto> {
    const card = await this.find(cardId);
    await this.access.requireRole(card.boardId, userId, 'EDITOR');
    if (input.afterCardId === cardId || input.beforeCardId === cardId) {
      throw new BadRequestException('A card cannot be its own neighbour');
    }

    const toList = await this.prisma.list.findUnique({ where: { id: input.toListId } });
    if (!toList || toList.boardId !== card.boardId) throw new BadRequestException('Target list is not on this board');

    const [after, before] = await Promise.all([
      input.afterCardId ? this.findNeighbour(input.afterCardId, input.toListId) : null,
      input.beforeCardId ? this.findNeighbour(input.beforeCardId, input.toListId) : null,
    ]);
    const position = safePosition(after?.position ?? null, before?.position ?? null);
    const updated = await this.writeIfCurrent(cardId, input.version, { listId: input.toListId, position });

    const where = toList.id === card.listId ? `within ${toList.title}` : `to ${toList.title}`;
    return this.publish(card.boardId, userId, updated, `moved "${updated.title}" ${where}`, clientId);
  }

  async remove(cardId: string, userId: string, clientId: string | null) {
    const card = await this.find(cardId);
    await this.access.requireRole(card.boardId, userId, 'EDITOR');
    await this.prisma.card.delete({ where: { id: cardId } });
    this.events.emit(card.boardId, clientId, { type: 'card.deleted', cardId });
    await this.activity.record(card.boardId, userId, `deleted "${card.title}"`, clientId);
  }

  /**
   * Optimistic concurrency: the write only lands if nobody changed the card since the client read it.
   * Losing writers get 409 with the current card, so the UI can show the latest state instead of overwriting it.
   */
  private async writeIfCurrent(
    cardId: string,
    expectedVersion: number,
    data: { title?: string; description?: string; listId?: string; position?: string },
  ): Promise<CardDto> {
    const { count } = await this.prisma.card.updateMany({
      where: { id: cardId, version: expectedVersion },
      data: { ...data, version: { increment: 1 } },
    });
    const current = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!current) throw new NotFoundException('Card not found');
    if (count === 0) {
      throw new ConflictException({
        message: 'Someone else changed this card. Showing the latest version.',
        card: toCardDto(current),
      });
    }
    return toCardDto(current);
  }

  private async publish(boardId: string, userId: string, card: CardDto, summary: string, clientId: string | null) {
    await this.prisma.board.update({ where: { id: boardId }, data: { updatedAt: new Date() } });
    this.events.emit(boardId, clientId, { type: 'card.upserted', card });
    await this.activity.record(boardId, userId, summary, clientId);
    return card;
  }

  private async find(cardId: string) {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  private async findNeighbour(cardId: string, listId: string) {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    // A neighbour that moved away means the client's view is stale.
    if (!card || card.listId !== listId) {
      throw new ConflictException('The board changed while you were moving this. Refresh and try again.');
    }
    return card;
  }
}
