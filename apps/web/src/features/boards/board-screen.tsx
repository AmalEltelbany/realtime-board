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
import { Avatar, Button, Input, noteColors } from "@/components/ui";
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
        <Link href="/boards" className="mt-2 inline-block text-sm text-accent hover:underline">Back to boards</Link>
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
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
        <Link href="/boards" className="rounded-full px-2 py-1 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-foreground">← Boards</Link>
        <span aria-hidden className="h-5 w-px bg-border" />
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
        <div role="status" className="flex items-center justify-between bg-note-yellow px-4 py-2 text-sm font-medium text-note-ink">
          {mutations.notice}
          <Button variant="ghost" onClick={mutations.dismissNotice}>Dismiss</Button>
        </div>
      )}
      {!canEdit && <p className="bg-note-sky/40 px-4 py-2 text-sm font-medium">You can view this board but not change it.</p>}

      <div className="flex min-h-0 flex-1">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDraggingId(null)}>
          <div className="dot-grid flex flex-1 items-start gap-4 overflow-x-auto p-5">
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
                  className="border-2 border-dashed bg-surface/70"
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
      <h1 className="text-lg font-extrabold tracking-tight">
        <button type="button" disabled={!canEdit} onClick={() => setEditing(true)} className="rounded-lg px-1.5 enabled:hover:bg-surface-muted">{title}</button>
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
  const styles: Record<ConnectionState, string> = {
    live: "bg-emerald-500",
    connecting: "bg-amber-400",
    offline: "bg-red-500",
  };
  const labels: Record<ConnectionState, string> = { live: "Live", connecting: "Connecting…", offline: "Offline, retrying" };
  return (
    <span role="status" aria-label={`Connection: ${labels[state]}`} className="flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted">
      <span className={`size-2 rounded-full ${styles[state]} ${state === "live" ? "animate-pulse-ring" : ""}`} /> {labels[state]}
    </span>
  );
}


