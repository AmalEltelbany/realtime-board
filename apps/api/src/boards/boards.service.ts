import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { positionBetween, type BoardDto, type BoardRole, type BoardSummaryDto, type MemberDto } from '@board/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardAccessService } from '../access/board-access.service.js';
import { BoardEventsService } from '../realtime/board-events.service.js';
import { ActivityService } from './activity.service.js';
import { toCardDto, toListDto } from './mappers.js';

const DEFAULT_LISTS = ['To do', 'In progress', 'Done'];

@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
    private readonly events: BoardEventsService,
    private readonly activity: ActivityService,
  ) {}

  async listForUser(userId: string): Promise<BoardSummaryDto[]> {
    const memberships = await this.prisma.boardMember.findMany({
      where: { userId },
      include: { board: true },
      orderBy: { board: { updatedAt: 'desc' } },
    });
    return memberships.map((m) => ({
      id: m.board.id,
      title: m.board.title,
      role: m.role,
      updatedAt: m.board.updatedAt.toISOString(),
    }));
  }

  async create(userId: string, title: string, listTitles = DEFAULT_LISTS): Promise<BoardSummaryDto> {
    const positions = listTitles.reduce<string[]>(
      (acc) => [...acc, positionBetween(acc.at(-1) ?? null, null)],
      [],
    );
    const board = await this.prisma.board.create({
      data: {
        title,
        members: { create: { userId, role: 'OWNER' } },
        lists: { create: listTitles.map((listTitle, i) => ({ title: listTitle, position: positions[i] })) },
      },
    });
    return { id: board.id, title: board.title, role: 'OWNER', updatedAt: board.updatedAt.toISOString() };
  }

  /** Used by the demo login: a board that already shows how the app works. */
  async createSampleBoard(userId: string) {
    const board = await this.create(userId, 'Product launch 🚀');
    const lists = await this.prisma.list.findMany({ where: { boardId: board.id }, orderBy: { position: 'asc' } });
    const samples: Record<string, string[]> = {
      'To do': ['Write launch announcement', 'Prepare demo video', 'Invite beta testers'],
      'In progress': ['Landing page copy', 'Fix onboarding bugs'],
      Done: ['Set up analytics'],
    };
    for (const list of lists) {
      let last: string | null = null;
      for (const title of samples[list.title] ?? []) {
        last = positionBetween(last, null);
        await this.prisma.card.create({ data: { boardId: board.id, listId: list.id, title, position: last } });
      }
    }
    return board;
  }

  async get(boardId: string, userId: string): Promise<BoardDto> {
    const role = await this.access.requireRole(boardId, userId, 'VIEWER');
    const board = await this.prisma.board.findUniqueOrThrow({
      where: { id: boardId },
      include: {
        members: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        lists: { orderBy: { position: 'asc' } },
        cards: { orderBy: { position: 'asc' } },
      },
    });
    return {
      id: board.id,
      title: board.title,
      role,
      members: board.members.map((m) => ({ role: m.role, user: { id: m.user.id, email: m.user.email, name: m.user.name } })),
      lists: board.lists.map(toListDto),
      cards: board.cards.map(toCardDto),
    };
  }

  async rename(boardId: string, userId: string, title: string, clientId: string | null) {
    await this.access.requireRole(boardId, userId, 'EDITOR');
    await this.prisma.board.update({ where: { id: boardId }, data: { title } });
    this.events.emit(boardId, clientId, { type: 'board.renamed', title });
    await this.activity.record(boardId, userId, `renamed the board to "${title}"`, clientId);
  }

  async remove(boardId: string, userId: string) {
    await this.access.requireRole(boardId, userId, 'OWNER');
    await this.prisma.board.delete({ where: { id: boardId } });
  }

  async invite(
    boardId: string,
    userId: string,
    email: string,
    role: Exclude<BoardRole, 'OWNER'>,
    clientId: string | null,
  ): Promise<MemberDto> {
    await this.access.requireRole(boardId, userId, 'OWNER');
    const invitee = await this.prisma.user.findUnique({ where: { email } });
    if (!invitee) throw new NotFoundException('No user with that email. Ask them to sign up first.');

    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: invitee.id } },
    });
    if (existing) throw new ConflictException('Already a member of this board');

    await this.prisma.boardMember.create({ data: { boardId, userId: invitee.id, role } });
    const member: MemberDto = { role, user: { id: invitee.id, email: invitee.email, name: invitee.name } };
    this.events.emit(boardId, clientId, { type: 'member.added', member });
    await this.activity.record(boardId, userId, `added ${invitee.name} as ${role.toLowerCase()}`, clientId);
    return member;
  }

  async activityFor(boardId: string, userId: string) {
    await this.access.requireRole(boardId, userId, 'VIEWER');
    return this.activity.recent(boardId);
  }
}
