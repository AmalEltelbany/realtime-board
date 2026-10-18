import { Avatar } from "@/components/ui";

const columns = [
  { title: "To do", color: "bg-sunburst", cards: ["Write launch post", "Pick a date"] },
  { title: "Doing", color: "bg-lavender", cards: ["Record walkthrough", "Ship v1"] },
  { title: "Done", color: "bg-mint-pop", cards: ["Design review"] },
];

/** The same board open in two tabs, with the card that just moved highlighted in both. Static, by design. */
export function TwoTabs() {
  return (
    <div aria-hidden className="grid gap-5 lg:grid-cols-2">
      <Tab label="Your tab" who="Amal" />
      <Tab label="Omar's tab" who="Omar" />
    </div>
  );
}

function Tab({ label, who }: { label: string; who: string }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-carbon bg-paper">
      <div className="flex items-center gap-2 border-b border-carbon px-5 py-3">
        <span className="label text-xs uppercase">{label}</span>
        <span className="label ms-2 flex items-center gap-1.5 rounded-full border border-carbon bg-mint-pop px-2 py-0.5 text-[10px] uppercase">
          <span className="size-1.5 rounded-full bg-carbon" /> Live
        </span>
        <span className="ms-auto flex -space-x-1.5">
          <Avatar name="Amal E" size="sm" />
          <Avatar name="Omar K" size="sm" />
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 bg-sky-wash p-4">
        {columns.map((column) => (
          <div key={column.title} className="rounded-[20px] border border-carbon bg-paper p-2.5">
            <p className="label mb-2 flex items-center gap-1.5 px-1 text-[11px] uppercase">
              <span className={`size-2.5 rounded-full border border-carbon ${column.color}`} /> {column.title}
            </p>
            <div className="flex flex-col gap-2">
              {column.cards.map((card) => {
                const moved = card === "Ship v1";
                return (
                  <div
                    key={card}
                    className={`rounded-2xl border border-carbon px-2.5 py-2 text-xs font-semibold ${moved ? "bg-sunburst" : "bg-paper"}`}
                  >
                    {card}
                    {moved && <span className="mt-1 block text-[10px] font-medium">moved by {who === "Amal" ? "you" : "Amal"}, just now</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
