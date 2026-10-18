import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server as App } from 'node:http';
import type { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, resetDatabase, signUp } from './helpers.js';

describe('auth', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });
  beforeEach(() => resetDatabase(prisma));
  afterAll(() => app.close());

  it('registers, keeps the session in an httpOnly cookie, and returns the user from /me', async () => {
    const agent = request.agent(app.getHttpServer());
    const res = await agent
      .post('/api/auth/register')
      .send({ email: 'Amal@Example.com', name: 'Amal', password: 'correct horse battery' })
      .expect(201);

    expect(res.body).toMatchObject({ email: 'amal@example.com', name: 'Amal' });
    expect(res.headers['set-cookie']?.[0]).toMatch(/board_session=.*HttpOnly/i);
    await agent.get('/api/auth/me').expect(200).expect((r) => expect(r.body.email).toBe('amal@example.com'));
  });

  it('never stores the plain password', async () => {
    await signUp(app, 'Hash');
    const user = await prisma.user.findFirstOrThrow();
    expect(user.passwordHash).toMatch(/^\$argon2/);
  });

  it('rejects a wrong password with the same message as an unknown email', async () => {
    const { user } = await signUp(app, 'Login');
    const wrongPassword = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: 'nope-nope' })
      .expect(401);
    const unknownEmail = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'nope-nope' })
      .expect(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it('validates input with the shared schemas', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', name: '', password: 'short' })
      .expect(400);
    expect(Object.keys(res.body.issues.fieldErrors)).toEqual(expect.arrayContaining(['email', 'name', 'password']));
  });

  it('creates a demo account with a sample board', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/api/auth/demo').expect(201);
    const boards = await agent.get('/api/boards').expect(200);
    expect(boards.body).toHaveLength(1);
    const board = await agent.get(`/api/boards/${boards.body[0].id}`).expect(200);
    expect(board.body.lists.map((l: { title: string }) => l.title)).toEqual(['To do', 'In progress', 'Done']);
    expect(board.body.cards.length).toBeGreaterThan(0);
  });

  it('does not accept a socket token as a session', async () => {
    const { agent } = await signUp(app, 'Socket');
    const { body } = await agent.get('/api/auth/socket-token').expect(200);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', `board_session=${body.token}`)
      .expect(401);
  });
});
