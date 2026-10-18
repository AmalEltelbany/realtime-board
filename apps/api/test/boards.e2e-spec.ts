import type { INestApplication } from '@nestjs/common';
import type { Server as App } from 'node:http';
import type { BoardDto, CardDto } from '@board/shared';
import type { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, resetDatabase, signUp } from './helpers.js';

describe('boards, lists and cards', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });
  beforeEach(() => resetDatabase(prisma));
  afterAll(() => app.close());

  async function boardWithCards() {
    const owner = await signUp(app, 'Owner');
    const created = await owner.agent.post('/api/boards').send({ title: 'Launch' }).expect(201);
    const board = (await owner.agent.get(`/api/boards/${created.body.id}`).expect(200)).body as BoardDto;
    const [todo, , done] = board.lists;
    const cards: CardDto[] = [];
    for (const title of ['A', 'B', 'C']) {
      cards.push((await owner.agent.post(`/api/lists/${todo.id}/cards`).send({ title }).expect(201)).body);
    }
    return { owner, board, todo, done, cards };
  }

  const titlesIn = async (agent: Awaited<ReturnType<typeof signUp>>['agent'], boardId: string, listId: string) => {
    const board = (await agent.get(`/api/boards/${boardId}`).expect(200)).body as BoardDto;
    return board.cards.filter((c) => c.listId === listId).map((c) => c.title);
  };

  it('creates a board with three default lists, owned by its creator', async () => {
    const { board } = await boardWithCards();
    expect(board.role).toBe('OWNER');
    expect(board.lists.map((l) => l.title)).toEqual(['To do', 'In progress', 'Done']);
  });

  it('moves a card between two others and keeps that order after a reload', async () => {
    const { owner, board, todo, cards } = await boardWithCards();
    const [a, b, c] = cards;
    // Move C between A and B.
    await owner.agent
      .post(`/api/cards/${c.id}/move`)
      .send({ toListId: todo.id, afterCardId: a.id, beforeCardId: b.id, version: c.version })
      .expect(200);
    expect(await titlesIn(owner.agent, board.id, todo.id)).toEqual(['A', 'C', 'B']);
  });

  it('moves a card to another list', async () => {
    const { owner, board, todo, done, cards } = await boardWithCards();
    await owner.agent
      .post(`/api/cards/${cards[1].id}/move`)
      .send({ toListId: done.id, afterCardId: null, beforeCardId: null, version: 1 })
      .expect(200);
    expect(await titlesIn(owner.agent, board.id, todo.id)).toEqual(['A', 'C']);
    expect(await titlesIn(owner.agent, board.id, done.id)).toEqual(['B']);
  });

  it('rejects a write based on a stale version with 409 and returns the current card', async () => {
    const { owner, cards } = await boardWithCards();
    const card = cards[0];
    await owner.agent.patch(`/api/cards/${card.id}`).send({ title: 'First edit', version: 1 }).expect(200);
    const res = await owner.agent.patch(`/api/cards/${card.id}`).send({ title: 'Stale edit', version: 1 }).expect(409);
    expect(res.body.card).toMatchObject({ title: 'First edit', version: 2 });
  });

  it('rejects neighbours that are in the wrong order (stale client view)', async () => {
    const { owner, todo, cards } = await boardWithCards();
    const [a, b, c] = cards;
    await owner.agent
      .post(`/api/cards/${c.id}/move`)
      .send({ toListId: todo.id, afterCardId: b.id, beforeCardId: a.id, version: 1 })
      .expect(409);
  });

  it('hides boards from non-members (404, not 403)', async () => {
    const { board } = await boardWithCards();
    const stranger = await signUp(app, 'Stranger');
    await stranger.agent.get(`/api/boards/${board.id}`).expect(404);
  });

  it('lets viewers read but not write', async () => {
    const { owner, board, todo } = await boardWithCards();
    const viewer = await signUp(app, 'Viewer');
    await owner.agent.post(`/api/boards/${board.id}/members`).send({ email: viewer.user.email, role: 'VIEWER' }).expect(201);

    await viewer.agent.get(`/api/boards/${board.id}`).expect(200);
    await viewer.agent.post(`/api/lists/${todo.id}/cards`).send({ title: 'Nope' }).expect(403);
  });

  it('only lets the owner invite members', async () => {
    const { owner, board } = await boardWithCards();
    const editor = await signUp(app, 'Editor');
    const other = await signUp(app, 'Other');
    await owner.agent.post(`/api/boards/${board.id}/members`).send({ email: editor.user.email, role: 'EDITOR' }).expect(201);
    await editor.agent.post(`/api/boards/${board.id}/members`).send({ email: other.user.email, role: 'EDITOR' }).expect(403);
  });

  it('records an activity log', async () => {
    const { owner, board } = await boardWithCards();
    const res = await owner.agent.get(`/api/boards/${board.id}/activity`).expect(200);
    expect(res.body[0].summary).toBe('added "C" to To do');
    expect(res.body).toHaveLength(3);
  });
});
