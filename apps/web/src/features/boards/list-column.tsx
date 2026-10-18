"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, type FormEvent } from "react";
import type { CardDto, ListDto } from "@board/shared";
import { Button, Input } from "@/components/ui";
import { CardTile } from "./card-tile";

export const listDropId = (listId: string) => `list:${listId}`;

interface Props {
  list: ListDto;
  /** Sticky-note colour, assigned by the list's position on the board. */
  color: string;
  cards: CardDto[];
  canEdit: boolean;
  onAddCard: (title: string) => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onOpenCard: (cardId: string) => void;
}

export function ListColumn({ list, color, cards, canEdit, onAddCard, onRename, onDelete, onOpenCard }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: listDropId(list.id), disabled: !canEdit });
  const [draft, setDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  function addCard(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    onAddCard(draft.trim());
    setDraft("");
  }

  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = String(new FormData(event.currentTarget).get("title") ?? "").trim();
    if (title && title !== list.title) onRename(title);
    setEditingTitle(false);
  }

  return (
    <section
      aria-label={list.title}
      className={`flex w-72 shrink-0 flex-col rounded-3xl bg-surface-muted/90 p-3 shadow-sm ring-1 ring-border/60 backdrop-blur ${isOver ? "ring-2 ring-accent" : ""}`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        {editingTitle ? (
          <form onSubmit={rename} className="flex-1">
            <Input name="title" defaultValue={list.title} autoFocus onBlur={(e) => e.currentTarget.form?.requestSubmit()} />
          </form>
        ) : (
          <h2 className="flex items-center gap-2 px-1 text-sm font-bold">
            <span aria-hidden className={`size-2.5 rounded-full ${color}`} />
            <button type="button" disabled={!canEdit} onClick={() => setEditingTitle(true)}>{list.title}</button>
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-muted">{cards.length}</span>
          </h2>
        )}
        {canEdit && (
          <Button
            variant="ghost"
            className="px-2 py-1"
            aria-label={`Delete list ${list.title}`}
            onClick={() => confirm(`Delete "${list.title}" and its ${cards.length} cards?`) && onDelete()}
          >
            ✕
          </Button>
        )}
      </header>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-12 flex-col gap-2">
          {cards.map((card) => (
            <CardTile key={card.id} card={card} canEdit={canEdit} color={color} onOpen={() => onOpenCard(card.id)} />
          ))}
        </ul>
      </SortableContext>

      {canEdit && (
        <form onSubmit={addCard} className="mt-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="+ Add a card"
            maxLength={200}
            className="border-transparent bg-transparent hover:bg-surface"
          />
        </form>
      )}
    </section>
  );
}
