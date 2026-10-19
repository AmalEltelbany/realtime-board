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
      className={`cursor-pointer rounded-xl border border-ink bg-paper px-3.5 py-3 text-sm font-semibold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${isDragging ? "opacity-30" : ""}`}
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
      <span aria-hidden className={`mb-2 block h-2 w-10 rounded-full border border-ink ${color}`} />
      {card.title}
      {card.description && <span className="mt-1.5 block text-xs font-medium text-muted">≡ has notes</span>}
    </li>
  );
}

export function CardPreview({ card }: { card: CardDto }) {
  return (
    <div className="pinned rotate-3 rounded-xl border border-ink bg-lime px-3.5 py-3 text-sm font-bold">{card.title}</div>
  );
}
