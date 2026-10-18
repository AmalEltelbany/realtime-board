"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardDto } from "@board/shared";

export function CardTile({ card, canEdit, onOpen }: { card: CardDto; canEdit: boolean; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: !canEdit,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`cursor-pointer rounded-lg border border-border bg-surface px-3 py-2.5 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-accent ${isDragging ? "opacity-40" : ""}`}
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
      {card.title}
      {card.description && <span className="mt-1 block text-xs text-muted">≡ has notes</span>}
    </li>
  );
}

export function CardPreview({ card }: { card: CardDto }) {
  return (
    <div className="rotate-2 rounded-lg border border-accent bg-surface px-3 py-2.5 text-sm shadow-lg">{card.title}</div>
  );
}
