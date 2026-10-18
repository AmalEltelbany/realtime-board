import type { ActivityDto, CardDto, ListDto, MemberDto, UserDto } from "./types.js";

/** Every board mutation is broadcast as one of these to the `board:<id>` room. */
export type BoardEvent =
  | { type: "card.upserted"; card: CardDto }
  | { type: "card.deleted"; cardId: string }
  | { type: "list.upserted"; list: ListDto }
  | { type: "list.deleted"; listId: string }
  | { type: "board.renamed"; title: string }
  | { type: "member.added"; member: MemberDto }
  | { type: "activity"; activity: ActivityDto };

export interface BoardEventEnvelope {
  boardId: string;
  /** Lets the client that caused a change skip its own echo (it already applied it optimistically). */
  originClientId: string | null;
  event: BoardEvent;
}

export interface PresenceUpdate {
  boardId: string;
  users: UserDto[];
}

export const SocketEvents = {
  join: "board:join",
  leave: "board:leave",
  event: "board:event",
  presence: "board:presence",
} as const;

/** Header the web client sends so the server can tag broadcasts with `originClientId`. */
export const CLIENT_ID_HEADER = "x-client-id";
