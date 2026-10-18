import type { INestApplication } from '@nestjs/common';
import type { Server as App } from 'node:http';
import { io, type Socket } from 'socket.io-client';
import { CLIENT_ID_HEADER, SocketEvents, type BoardDto, type BoardEventEnvelope, type PresenceUpdate } from '@board/shared';
import type { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, resetDatabase, serverUrl, signUp } from './helpers.js';

describe('realtime', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const sockets: Socket[] = [];

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });
  beforeEach(() => resetDatabase(prisma));
  afterEach(() => sockets.splice(0).forEach((s) => s.disconnect()));
  afterAll(() => app.close());

  async function connect(agent: Awaited<ReturnType<typeof signUp>>['agent']) {
    const { body } = await agent.get('/api/auth/socket-token').expect(200);
    const socket = io(serverUrl(app), { auth: { token: body.token }, transports: ['websocket'] });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('connect_error', reject);
    });
    return socket;
  }

  const join = (socket: Socket, boardId: string) =>
    socket.emitWithAck(SocketEvents.join, { boardId }) as Promise<{ ok: boolean }>;

  const nextEvent = (socket: Socket, type: string) =>
    new Promise<BoardEventEnvelope>((resolve) => {
      const handler = (envelope: BoardEventEnvelope) => {
        if (envelope.event.type === type) {
          socket.off(SocketEvents.event, handler);
          resolve(envelope);
        }
      };
      socket.on(SocketEvents.event, handler);
    });

  it('pushes a card change to every member watching the board, tagged with the origin tab', async () => {
    const owner = await signUp(app, 'Owner');
    const editor = await signUp(app, 'Editor');
    const { body: created } = await owner.agent.post('/api/boards').send({ title: 'Live' }).expect(201);
    await owner.agent.post(`/api/boards/${created.id}/members`).send({ email: editor.user.email, role: 'EDITOR' }).expect(201);
    const board = (await owner.agent.get(`/api/boards/${created.id}`)).body as BoardDto;

    const editorSocket = await connect(editor.agent);
    expect(await join(editorSocket, board.id)).toEqual({ ok: true });

    const received = nextEvent(editorSocket, 'card.upserted');
    await owner.agent
      .post(`/api/lists/${board.lists[0].id}/cards`)
      .set(CLIENT_ID_HEADER, 'owner-tab-1')
      .send({ title: 'Ship it' })
      .expect(201);

    const envelope = await received;
    expect(envelope.originClientId).toBe('owner-tab-1');
    expect(envelope.event).toMatchObject({ type: 'card.upserted', card: { title: 'Ship it' } });
  });

  it('refuses to let a non-member join a board room', async () => {
    const owner = await signUp(app, 'Owner');
    const stranger = await signUp(app, 'Stranger');
    const { body: board } = await owner.agent.post('/api/boards').send({ title: 'Private' }).expect(201);

    const socket = await connect(stranger.agent);
    expect(await join(socket, board.id)).toEqual({ ok: false });
  });

  it('broadcasts who is viewing the board', async () => {
    const owner = await signUp(app, 'Owner');
    const { body: board } = await owner.agent.post('/api/boards').send({ title: 'Presence' }).expect(201);
    const socket = await connect(owner.agent);

    const presence = new Promise<PresenceUpdate>((resolve) => socket.once(SocketEvents.presence, resolve));
    await join(socket, board.id);
    expect((await presence).users.map((u) => u.name)).toEqual(['Owner']);
  });

  it('rejects connections without a valid socket token', async () => {
    const socket = io(serverUrl(app), { auth: { token: 'forged' }, transports: ['websocket'] });
    sockets.push(socket);
    await new Promise<void>((resolve) => socket.once('disconnect', () => resolve()));
    expect(socket.connected).toBe(false);
  });
});
