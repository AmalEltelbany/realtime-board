import { Body, Controller, Delete, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { moveCardSchema, updateCardSchema, type MoveCardInput } from '@board/shared';
import { AuthGuard } from '../auth/auth.guard.js';
import { ClientId, CurrentUser, type AuthUser } from '../common/request-context.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CardsService } from './cards.service.js';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Patch(':cardId')
  update(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('cardId') cardId: string,
    @Body(new ZodValidationPipe(updateCardSchema)) body: z.infer<typeof updateCardSchema>,
  ) {
    return this.cards.update(cardId, user.id, body, clientId);
  }

  @Post(':cardId/move')
  @HttpCode(200)
  move(
    @CurrentUser() user: AuthUser,
    @ClientId() clientId: string | null,
    @Param('cardId') cardId: string,
    @Body(new ZodValidationPipe(moveCardSchema)) body: MoveCardInput,
  ) {
    return this.cards.move(cardId, user.id, body, clientId);
  }

  @Delete(':cardId')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @ClientId() clientId: string | null, @Param('cardId') cardId: string) {
    return this.cards.remove(cardId, user.id, clientId);
  }
}
