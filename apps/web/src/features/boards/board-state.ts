import { comparePositions, positionBetween, type BoardDto, type BoardEvent, type CardDto, type MoveCardInput } from "@board/shared";

/** Pure functions over the cached board, shared by optimistic updates and incoming socket events. */

export function cardsInList(board: BoardDto, listId: string): CardDto[] {
  return board.cards.filter((card) => card.listId === listId).sort(comparePositions);
}

export function upsertCard(board: BoardDto, card: CardDto): BoardDto {
  const existing = board.cards.find((c) => c.id === card.id);
  // Events can arrive out of order; never let an older version overwrite a newer one.
  if (existing && existing.version > card.version) return board;
  return {
    ...board,
    cards: existing ? board.cards.map((c) => (c.id === card.id ? card : c)) : [...board.cards, card],
  };
}

export function applyBoardEvent(board: BoardDto, event: BoardEvent): BoardDto {
  switch (event.type) {
    case "card.upserted":
      return upsertCard(board, event.card);
    case "card.deleted":
      return { ...board, cards: board.cards.filter((c) => c.id !== event.cardId) };
    case "list.upserted": {
      const exists = board.lists.some((l) => l.id === event.list.id);
      const lists = exists ? board.lists.map((l) => (l.id === event.list.id ? event.list : l)) : [...board.lists, event.list];
      return { ...board, lists: lists.sort(comparePositions) };
    }
    case "list.deleted":
      return {
        ...board,
        lists: board.lists.filter((l) => l.id !== event.listId),
        cards: board.cards.filter((c) => c.listId !== event.listId),
      };
    case "board.renamed":
      return { ...board, title: event.title };
    case "member.added":
      return board.members.some((m) => m.user.id === event.member.user.id)
        ? board
        : { ...board, members: [...board.members, event.member] };
    case "activity":
      return board;
  }
}

/**
 * Works out where a dropped card lands: its new neighbours and a local position for the optimistic update.
 * `index` is the slot in the target list once the card itself is taken out.
 */
export function planMove(
  board: BoardDto,
  cardId: string,
  toListId: string,
  index: number,
): { input: MoveCardInput; optimistic: BoardDto } | null {
  const card = board.cards.find((c) => c.id === cardId);
  if (!card) return null;

  const siblings = cardsInList(board, toListId).filter((c) => c.id !== cardId);
  const slot = Math.max(0, Math.min(index, siblings.length));
  const after = siblings[slot - 1] ?? null;
  const before = siblings[slot] ?? null;

  if (card.listId === toListId && cardsInList(board, toListId).indexOf(card) === slot) return null; // dropped where it was

  const moved: CardDto = {
    ...card,
    listId: toListId,
    position: positionBetween(after?.position ?? null, before?.position ?? null),
  };
  return {
    input: { toListId, afterCardId: after?.id ?? null, beforeCardId: before?.id ?? null, version: card.version },
    optimistic: { ...board, cards: board.cards.map((c) => (c.id === cardId ? moved : c)) },
  };
}
