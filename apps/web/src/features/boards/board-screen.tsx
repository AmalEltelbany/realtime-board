"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { comparePositions, type BoardDto } from "@board/shared";
import { Avatar, Button, Input, LogoMark, noteColors } from "@/components/ui";
import { ActivityPanel } from "./activity-panel";
import { cardsInList, planMove } from "./board-state";
import { CardDialog } from "./card-dialog";
import { CardPreview } from "./card-tile";
import { InviteDialog } from "./invite-dialog";
import { ListColumn } from "./list-column";
import { useBoard, useBoardMutations } from "./use-board";
import { useBoardRealtime, type ConnectionState } from "./use-board-realtime";

export function BoardScreen({ boardId }: { boardId: string }) {
  const board = useBoard(boardId);

  if (board.isPending) return <p className="p-8 text-sm text-muted">Loading board…</p>;
  if (board.isError) {
    return (
      <div className="p-8">
        <p className="text-sm text-danger">{board.error.message}</p>
        <Link href="/boards" className="mt-2 inline-block text-sm font-bold underline underline-offset-4">Back to boards</Link>
      </div>
    );
  }
  return <Board board={board.data} />;
}

function Board({ board }: { board: BoardDto }) {
  const mutations = useBoardMutations(board.id);
  const { viewers, connection } = useBoardRealtime(board.id);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [newList, setNewList] = useState("");

  const canEdit = board.role !== "VIEWER";
  const lists = [...board.lists].sort(comparePositions);
  const openCard = board.cards.find((c) => c.id === openCardId) ?? null;
  const draggingCard = board.cards.find((c) => c.id === draggingId) ?? null;

  const sensors = useSensors(
    // A small distance threshold so a click still opens the card instead of starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null);
    if (!over) return;
    const cardId = String(active.id);
    const overId = String(over.id);

    let toListId: string;
    let index: number;
    if (overId.startsWith("list:")) {
      // Dropped on a list's empty space: append.
      toListId = overId.slice("list:".length);
      index = cardsInList(board, toListId).filter((c) => c.id !== cardId).length;
    } else {
      const overCard = board.cards.find((c) => c.id === overId);
      if (!overCard) return;
      toListId = overCard.listId;
      index = cardsInList(board, toListId).findIndex((c) => c.id === overId);
    }

    const plan = planMove(board, cardId, toListId, index);
    if (plan) mutations.moveCard.mutate({ cardId, input: plan.input, optimistic: plan.optimistic });
  }

  function addList(event: FormEvent) {
    event.preventDefault();
    if (!newList.trim()) return;
    mutations.createList.mutate(newList.trim());
    setNewList("");
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-ink bg-paper px-4 py-2.5">
        <Link href="/boards" aria-label="Boards"><LogoMark className="size-8" /></Link>
        <Link href="/boards" className="tag rounded-full border border-ink px-3 py-1.5 text-xs hover:bg-canvas">← Boards</Link>
        <BoardTitle title={board.title} canEdit={canEdit} onRename={(title) => mutations.renameBoard.mutate(title)} />
        <ConnectionBadge state={connection} />
        <div className="ms-auto flex items-center gap-3">
          <div className="flex -space-x-2" aria-label="People viewing this board">
            {viewers.map((v) => <Avatar key={v.id} name={v.name} title={`${v.name} is viewing`} />)}
          </div>
          {board.role === "OWNER" && <Button onClick={() => setInviteOpen(true)}>Share</Button>}
          <Button variant="secondary" aria-pressed={showActivity} onClick={() => setShowActivity((v) => !v)}>Activity</Button>
        </div>
      </header>

      {mutations.notice && (
        <div role="status" className="flex items-center justify-between border-b border-ink bg-lime px-4 py-2 text-sm font-bold">
          {mutations.notice}
          <Button variant="ghost" onClick={mutations.dismissNotice}>Dismiss</Button>
        </div>
      )}
      {!canEdit && <p className="border-b border-ink bg-bubblegum px-4 py-2 text-sm font-bold">You can view this board but not change it.</p>}

      <div className="flex min-h-0 flex-1">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDraggingId(null)}>
          <div className="grid-paper flex flex-1 items-start gap-5 overflow-x-auto p-6">
            {lists.map((list, i) => (
              <ListColumn
                key={list.id}
                list={list}
                color={noteColors[i % noteColors.length]}
                cards={cardsInList(board, list.id)}
                canEdit={canEdit}
                onAddCard={(title) => mutations.createCard.mutate({ listId: list.id, title })}
                onRename={(title) => mutations.renameList.mutate({ listId: list.id, title })}
                onDelete={() => mutations.deleteList.mutate(list.id)}
                onOpenCard={setOpenCardId}
              />
            ))}
            {canEdit && (
              <form onSubmit={addList} className="w-72 shrink-0">
                <Input
                  value={newList}
                  onChange={(e) => setNewList(e.target.value)}
                  placeholder="+ Add a list"
                  maxLength={100}
                  className="border-dashed"
                />
              </form>
            )}
          </div>
          <DragOverlay>{draggingCard ? <CardPreview card={draggingCard} /> : null}</DragOverlay>
        </DndContext>
        {showActivity && <ActivityPanel boardId={board.id} />}
      </div>

      {openCard && (
        <CardDialog
          key={openCard.id}
          card={openCard}
          canEdit={canEdit}
          onSave={(patch) => mutations.updateCard.mutate({ cardId: openCard.id, ...patch })}
          onDelete={() => mutations.deleteCard.mutate(openCard.id)}
          onClose={() => setOpenCardId(null)}
        />
      )}
      {inviteOpen && <InviteDialog board={board} onClose={() => setInviteOpen(false)} />}
    </div>
  );
}

function BoardTitle({ title, canEdit, onRename }: { title: string; canEdit: boolean; onRename: (title: string) => void }) {
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <h1 className="text-xl font-bold tracking-tight">
        <button type="button" disabled={!canEdit} onClick={() => setEditing(true)} className="rounded-full px-2 enabled:hover:bg-canvas">{title}</button>
      </h1>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const next = String(new FormData(e.currentTarget).get("title") ?? "").trim();
        if (next && next !== title) onRename(next);
        setEditing(false);
      }}
    >
      <Input name="title" defaultValue={title} autoFocus onBlur={(e) => e.currentTarget.form?.requestSubmit()} />
    </form>
  );
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const fills: Record<ConnectionState, string> = {
    live: "bg-lime",
    connecting: "bg-sand",
    offline: "bg-tangerine",
  };
  const labels: Record<ConnectionState, string> = { live: "Live", connecting: "Connecting…", offline: "Offline, retrying" };
  return (
    <span
      role="status"
      aria-label={`Connection: ${labels[state]}`}
      className={`tag flex items-center gap-1.5 rounded-full border border-ink px-2.5 py-1 text-[11px] uppercase ${fills[state]}`}
    >
      <span className={`size-2 rounded-full ${state === "live" ? "animate-blink bg-wire" : "bg-ink opacity-40"}`} /> {labels[state]}
    </span>
  );
}
