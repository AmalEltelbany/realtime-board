import { Body, Controller, Delete, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { createCardSchema, createListSchema, moveListSchema, renameSchema } from '@board/shared';
import { AuthGuard } from '../auth/auth.guard.js';
import { ClientId, CurrentUser, type AuthUser } from '../common/request-context.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CardsService } from './cards.service.js';
import { ListsService } from './lists.service.js';

@Controller()
@UseGuards(AuthGuard)
export class ListsController {
  constructor(
    private readonly lists: ListsService,
    private readonly cards: CardsService,
  ) {}

  @Post('boards/:boardId/lists')
  create(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('boardId') boardId: string,
    @Body(new ZodValidationPipe(createListSchema)) body: z.infer<typeof createListSchema>,
  ) {
    return this.lists.create(boardId, user.id, body.title, clientId);
  }

  @Patch('lists/:listId')
  rename(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('listId') listId: string,
    @Body(new ZodValidationPipe(renameSchema)) body: z.infer<typeof renameSchema>,
  ) {
    return this.lists.rename(listId, user.id, body.title, clientId);
  }

  @Post('lists/:listId/move')
  @HttpCode(200)
  move(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('listId') listId: string,
    @Body(new ZodValidationPipe(moveListSchema)) body: z.infer<typeof moveListSchema>,
  ) {
    return this.lists.move(listId, user.id, body.afterListId, body.beforeListId, clientId);
  }

  @Delete('lists/:listId')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @ClientId() clientId: string | null, @Param('listId') listId: string) {
    return this.lists.remove(listId, user.id, clientId);
  }

  @Post('lists/:listId/cards')
  createCard(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('listId') listId: string,
    @Body(new ZodValidationPipe(createCardSchema)) body: z.infer<typeof createCardSchema>,
  ) {
    return this.cards.create(listId, user.id, body.title, clientId);
  }
}
