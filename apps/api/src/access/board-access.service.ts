import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { BoardRole } from '@board/shared';
import { PrismaService } from '../prisma/prisma.service.js';

const RANK: Record<BoardRole, number> = { VIEWER: 1, EDITOR: 2, OWNER: 3 };

/** Every board read or write goes through here: it's the one place that decides who may do what. */
@Injectable()
export class BoardAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async requireRole(boardId: string, userId: string, minimum: BoardRole): Promise<BoardRole> {
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
      select: { role: true },
    });
    // Non-members get 404, not 403, so board IDs can't be probed.
    if (!membership) throw new NotFoundException('Board not found');
    if (RANK[membership.role] < RANK[minimum]) {
      throw new ForbiddenException(`This action needs the ${minimum.toLowerCase()} role`);
    }
    return membership.role;
  }
}
