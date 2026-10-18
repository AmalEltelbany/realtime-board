import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module.js';
import { TokensModule } from '../auth/tokens.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { ActivityService } from './activity.service.js';
import { BoardsController } from './boards.controller.js';
import { BoardsService } from './boards.service.js';
import { CardsController } from './cards.controller.js';
import { CardsService } from './cards.service.js';
import { ListsController } from './lists.controller.js';
import { ListsService } from './lists.service.js';

@Module({
  imports: [TokensModule, AccessModule, RealtimeModule],
  controllers: [BoardsController, ListsController, CardsController],
  providers: [BoardsService, ListsService, CardsService, ActivityService],
  exports: [BoardsService],
})
export class BoardsModule {}
