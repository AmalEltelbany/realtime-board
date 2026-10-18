import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server as App } from 'node:http';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/bootstrap.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();
  await app.listen(0);
  const prisma = app.get(PrismaService);
  return { app, prisma };
}

export async function resetDatabase(prisma: PrismaService) {
  await prisma.$executeRawUnsafe('TRUNCATE "Activity", "Card", "List", "BoardMember", "Board", "User" CASCADE');
}

let counter = 0;

/** Registers a user and returns a supertest agent that keeps the session cookie. */
export async function signUp(app: INestApplication<App>, name = 'User') {
  counter += 1;
  const agent = request.agent(app.getHttpServer());
  const email = `${name.toLowerCase()}-${counter}@example.com`;
  const res = await agent.post('/api/auth/register').send({ email, name, password: 'correct horse battery' }).expect(201);
  return { agent, user: res.body as { id: string; email: string; name: string } };
}

export function serverUrl(app: INestApplication<App>) {
  const address = app.getHttpServer().address();
  if (!address || typeof address === 'string') throw new Error('server not listening');
  return `http://127.0.0.1:${address.port}`;
}
