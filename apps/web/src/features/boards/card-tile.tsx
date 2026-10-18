"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardDto } from "@board/shared";

export function CardTile({ card, canEdit, color, onOpen }: { card: CardDto; canEdit: boolean; color: string; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: !canEdit,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`cursor-pointer rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm font-medium shadow-sm transition hover:-translate-y-px hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent ${isDragging ? "opacity-40" : ""}`}
      {...attributes}
      {...listeners}
      // dnd-kit makes the tile a keyboard-focusable button (space picks it up); Enter and click open it.
      tabIndex={0}
      role="button"
      aria-label={card.title}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
        else listeners?.onKeyDown?.(event);
      }}
    >
      <span aria-hidden className={`mb-2 block h-1.5 w-10 rounded-full ${color}`} />
      {card.title}
      {card.description && <span className="mt-1.5 block text-xs font-normal text-muted">≡ has notes</span>}
    </li>
  );
}

export function CardPreview({ card }: { card: CardDto }) {
  return (
    <div className="rotate-3 rounded-2xl border-2 border-accent bg-surface px-3.5 py-3 text-sm font-semibold shadow-2xl">{card.title}</div>
  );
}
