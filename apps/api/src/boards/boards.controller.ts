import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { createBoardSchema, inviteMemberSchema, renameSchema } from '@board/shared';
import { AuthGuard } from '../auth/auth.guard.js';
import { ClientId, CurrentUser, type AuthUser } from '../common/request-context.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { BoardsService } from './boards.service.js';

@Controller('boards')
@UseGuards(AuthGuard)
export class BoardsController {
  constructor(private readonly boards: BoardsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.boards.listForUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body(new ZodValidationPipe(createBoardSchema)) body: z.infer<typeof createBoardSchema>) {
    return this.boards.create(user.id, body.title);
  }

  @Get(':boardId')
  get(@CurrentUser() user: AuthUser, @Param('boardId') boardId: string) {
    return this.boards.get(boardId, user.id);
  }

  @Patch(':boardId')
  @HttpCode(204)
  rename(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('boardId') boardId: string,
    @Body(new ZodValidationPipe(renameSchema)) body: z.infer<typeof renameSchema>,
  ) {
    return this.boards.rename(boardId, user.id, body.title, clientId);
  }

  @Delete(':boardId')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('boardId') boardId: string) {
    return this.boards.remove(boardId, user.id);
  }

  @Post(':boardId/members')
  invite(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('boardId') boardId: string,
    @Body(new ZodValidationPipe(inviteMemberSchema)) body: z.infer<typeof inviteMemberSchema>,
  ) {
    return this.boards.invite(boardId, user.id, body.email, body.role, clientId);
  }

  @Get(':boardId/activity')
  activity(@CurrentUser() user: AuthUser, @Param('boardId') boardId: string) {
    return this.boards.activityFor(boardId, user.id);
  }
}
