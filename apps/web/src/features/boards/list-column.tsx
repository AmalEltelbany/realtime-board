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
  cards: CardDto[];
  canEdit: boolean;
  onAddCard: (title: string) => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onOpenCard: (cardId: string) => void;
}

export function ListColumn({ list, cards, canEdit, onAddCard, onRename, onDelete, onOpenCard }: Props) {
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
      className={`flex w-72 shrink-0 flex-col rounded-xl bg-surface-muted p-3 ${isOver ? "ring-2 ring-accent" : ""}`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        {editingTitle ? (
          <form onSubmit={rename} className="flex-1">
            <Input name="title" defaultValue={list.title} autoFocus onBlur={(e) => e.currentTarget.form?.requestSubmit()} />
          </form>
        ) : (
          <h2 className="text-sm font-semibold">
            <button type="button" disabled={!canEdit} onClick={() => setEditingTitle(true)}>{list.title}</button>
            <span className="ms-2 text-xs font-normal text-muted">{cards.length}</span>
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
            <CardTile key={card.id} card={card} canEdit={canEdit} onOpen={() => onOpenCard(card.id)} />
          ))}
        </ul>
      </SortableContext>

      {canEdit && (
        <form onSubmit={addCard} className="mt-3">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="+ Add a card" maxLength={200} />
        </form>
      )}
    </section>
  );
}
