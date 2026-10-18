import { Avatar } from "@/components/ui";

const columns = [
  { title: "To do", color: "bg-note-yellow", cards: ["Write launch post", "Pick a date"] },
  { title: "Doing", color: "bg-note-sky", cards: ["Record walkthrough"] },
  { title: "Done", color: "bg-note-mint", cards: ["Design review", "Pricing page"] },
];

/** A static board mock: one card travels between columns while two cursors move, all in CSS. */
export function HeroBoard() {
  return (
    <div aria-hidden className="relative">
      <div className="animate-float absolute -end-3 -top-6 z-10 rotate-6 rounded-2xl bg-note-pink px-3 py-2 text-xs font-semibold text-note-ink shadow-lg">
        Open it in two tabs ✌
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(31,27,22,0.35)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ms-3 text-sm font-semibold">Product launch 🚀</span>
          <span className="ms-2 flex items-center gap-1.5 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-muted">
            <span className="animate-pulse-ring size-1.5 rounded-full bg-green-500" /> Live
          </span>
          <span className="ms-auto flex -space-x-2">
            <Avatar name="Amal E" size="sm" />
            <Avatar name="Omar K" size="sm" />
            <Avatar name="Sara M" size="sm" />
          </span>
        </div>

        <div className="dot-grid relative grid grid-cols-3 gap-4 p-4">
          {columns.map((column, i) => (
            <div key={column.title} className="rounded-2xl bg-surface-muted p-2.5">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold">
                <span className={`size-2 rounded-full ${column.color}`} /> {column.title}
              </p>
              <div className="flex flex-col gap-2">
                {column.cards.map((card) => (
                  <div key={card} className="rounded-xl border border-border bg-surface px-2.5 py-2 text-xs shadow-sm">
                    <span className={`mb-1.5 block h-1 w-8 rounded-full ${column.color}`} />
                    {card}
                  </div>
                ))}
                {/* The travelling card starts in the first column and slides one column right. */}
                {i === 0 && (
                  <div className="relative">
                    <div className="animate-card-travel relative z-10 rounded-xl border-2 border-accent bg-surface px-2.5 py-2 text-xs font-semibold shadow-lg">
                      <span className="mb-1.5 block h-1 w-8 rounded-full bg-accent" />
                      Ship v1 🎉
                      <span className="animate-cursor-a absolute -bottom-5 start-6 flex items-center gap-1">
                        <Cursor className="text-accent" />
                        <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">Amal</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <span className="animate-cursor-b absolute end-16 top-16 flex items-center gap-1">
            <Cursor className="text-[#3b82f6]" />
            <span className="rounded-md bg-[#3b82f6] px-1.5 py-0.5 text-[10px] font-bold text-white">Omar</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Cursor({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 drop-shadow ${className}`} fill="currentColor">
      <path d="M1 1l5.5 13 2-5.5L14 6.5z" stroke="white" strokeWidth="1" />
    </svg>
  );
}
