import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokensModule } from './tokens.module.js';

@Module({
  imports: [TokensModule, BoardsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
