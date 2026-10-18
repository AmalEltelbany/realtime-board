import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module.js';
import { TokensModule } from '../auth/tokens.module.js';
import { BoardEventsService } from './board-events.service.js';
import { BoardGateway } from './board.gateway.js';

@Module({
  imports: [TokensModule, AccessModule],
  providers: [BoardEventsService, BoardGateway],
  exports: [BoardEventsService],
})
export class RealtimeModule {}
