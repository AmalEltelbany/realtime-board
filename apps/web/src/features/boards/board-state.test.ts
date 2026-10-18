import { describe, expect, it } from "vitest";
import { positionBetween, type BoardDto, type CardDto } from "@board/shared";
import { applyBoardEvent, cardsInList, planMove } from "./board-state";

function makeBoard(): BoardDto {
  const p1 = positionBetween(null, null);
  const p2 = positionBetween(p1, null);
  const p3 = positionBetween(p2, null);
  const card = (id: string, listId: string, position: string): CardDto => ({
    id, listId, position, title: id.toUpperCase(), description: "", version: 1, updatedAt: "2026-01-01T00:00:00.000Z",
  });
  return {
    id: "b1",
    title: "Board",
    role: "OWNER",
    members: [],
    lists: [
      { id: "todo", title: "To do", position: p1 },
      { id: "done", title: "Done", position: p2 },
    ],
    cards: [card("a", "todo", p1), card("b", "todo", p2), card("c", "todo", p3)],
  };
}

const titles = (board: BoardDto, listId: string) => cardsInList(board, listId).map((c) => c.id);

describe("planMove", () => {
  it("moves a card up within its list and reports its new neighbours", () => {
    const plan = planMove(makeBoard(), "c", "todo", 1)!;
    expect(plan.input).toMatchObject({ afterCardId: "a", beforeCardId: "b", version: 1 });
    expect(titles(plan.optimistic, "todo")).toEqual(["a", "c", "b"]);
  });

  it("moves a card to the end of another list", () => {
    const plan = planMove(makeBoard(), "a", "done", 0)!;
    expect(plan.input).toMatchObject({ toListId: "done", afterCardId: null, beforeCardId: null });
    expect(titles(plan.optimistic, "todo")).toEqual(["b", "c"]);
    expect(titles(plan.optimistic, "done")).toEqual(["a"]);
  });

  it("does nothing when the card is dropped where it already was", () => {
    expect(planMove(makeBoard(), "b", "todo", 1)).toBeNull();
  });
});

describe("applyBoardEvent", () => {
  it("ignores an older version of a card arriving after a newer one", () => {
    const board = makeBoard();
    const newer = applyBoardEvent(board, { type: "card.upserted", card: { ...board.cards[0], title: "New", version: 3 } });
    const stale = applyBoardEvent(newer, { type: "card.upserted", card: { ...board.cards[0], title: "Old", version: 2 } });
    expect(stale.cards[0].title).toBe("New");
  });

  it("removes a deleted list together with its cards", () => {
    const next = applyBoardEvent(makeBoard(), { type: "list.deleted", listId: "todo" });
    expect(next.lists.map((l) => l.id)).toEqual(["done"]);
    expect(next.cards).toHaveLength(0);
  });

  it("adds a new card from another user", () => {
    const board = makeBoard();
    const card = { ...board.cards[0], id: "z", listId: "done", version: 1 };
    expect(titles(applyBoardEvent(board, { type: "card.upserted", card }), "done")).toEqual(["z"]);
  });
});
