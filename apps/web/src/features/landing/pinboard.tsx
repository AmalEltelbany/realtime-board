const mono = "var(--font-jetbrains), ui-monospace, monospace";
const sans = "var(--font-instrument), system-ui, sans-serif";

/** A strip of real board events scrolling by: what the WebSocket would carry. */
export function EventTicker({ events }: { events: string[] }) {
  const run = [...events, ...events];
  return (
    <div aria-hidden className="overflow-hidden border-b border-ink bg-ink py-2 text-paper">
      <div className="animate-ticker flex w-max gap-10 whitespace-nowrap">
        {[...run, ...run].map((event, i) => (
          <span key={i} className="tag flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-wire" />
            {event}
          </span>
        ))}
      </div>
    </div>
  );
}

// Drops into the gap between the tabs, then runs along an empty row so it never covers a card.
const wire = "M268 187 C 318 190, 296 305, 478 303";

type MiniCard = { x: number; y: number; text: string; hot?: boolean };

function Tab({ x, y, label, cards }: { x: number; y: number; label: string; cards: MiniCard[] }) {
  return (
    <g>
      <rect x={x + 6} y={y + 6} width="276" height="300" rx="20" fill="#141210" />
      <rect x={x} y={y} width="276" height="300" rx="20" fill="#fffdf7" stroke="#141210" strokeWidth="2" />
      <text x={x + 20} y={y + 30} fontFamily={mono} fontSize="11" fontWeight="700" letterSpacing="0.8">{label}</text>
      <rect x={x + 196} y={y + 15} width="62" height="22" rx="11" fill="#c9f23e" stroke="#141210" strokeWidth="1.5" />
      <circle cx={x + 211} cy={y + 26} r="3.5" fill="#ff3d2e" className="animate-blink" />
      <text x={x + 220} y={y + 30} fontFamily={mono} fontSize="10" fontWeight="700">LIVE</text>
      <line x1={x} x2={x + 276} y1={y + 48} y2={y + 48} stroke="#141210" strokeWidth="2" />
      {[0, 1].map((col) => (
        <g key={col}>
          <rect x={x + 16 + col * 126} y={y + 62} width="118" height="222" rx="14" fill="#f4efe4" stroke="#141210" strokeWidth="1.5" />
          <text x={x + 28 + col * 126} y={y + 82} fontFamily={mono} fontSize="10" fontWeight="700">{col === 0 ? "TO DO" : "DOING"}</text>
        </g>
      ))}
      {cards.map((card) => (
        <g key={card.text}>
          <rect
            x={card.x}
            y={card.y}
            width="102"
            height={card.hot ? 46 : 38}
            rx="10"
            fill={card.hot ? "#c9f23e" : "#fffdf7"}
            stroke="#141210"
            strokeWidth={card.hot ? 2 : 1.5}
          />
          <text x={card.x + 10} y={card.y + 23} fontFamily={sans} fontSize="12" fontWeight="600">{card.text}</text>
          {card.hot && <text x={card.x + 10} y={card.y + 37} fontFamily={mono} fontSize="8.5">MOVED · JUST NOW</text>}
        </g>
      ))}
    </g>
  );
}

/**
 * The same board in two tabs. A red wire links the card that just moved in one tab to the same card in the other,
 * and a pulse runs along it: one change, delivered everywhere.
 */
export function SyncWire({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 620 470" role="img" aria-label="The same board open in two tabs, linked by a live wire" className={className}>
      <Tab
        x={16}
        y={24}
        label="YOUR TAB"
        cards={[
          { x: 40, y: 118, text: "Launch post" },
          { x: 40, y: 210, text: "Pick a date" },
          { x: 166, y: 118, text: "Record demo" },
          { x: 166, y: 164, text: "Ship v1", hot: true },
        ]}
      />
      <Tab
        x={328}
        y={140}
        label="OMAR'S TAB"
        cards={[
          { x: 352, y: 234, text: "Launch post" },
          { x: 352, y: 326, text: "Pick a date" },
          { x: 478, y: 234, text: "Record demo" },
          { x: 478, y: 280, text: "Ship v1", hot: true },
        ]}
      />

      <path d={wire} fill="none" stroke="#141210" strokeWidth="6" strokeLinecap="round" />
      <path d={wire} fill="none" stroke="#ff3d2e" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="268" cy="187" r="7" fill="#ff3d2e" stroke="#141210" strokeWidth="2" />
      <circle cx="478" cy="303" r="7" fill="#ff3d2e" stroke="#141210" strokeWidth="2" />
      <circle r="6" fill="#fffdf7" stroke="#141210" strokeWidth="2" className="wire-pulse">
        <animateMotion dur="2.2s" repeatCount="indefinite" path={wire} />
      </circle>

      <g className="animate-drift">
        <path d="M540 350 l12 30 5-12 13-4z" fill="#2b4dff" stroke="#fffdf7" strokeWidth="1.5" />
        <rect x="554" y="380" width="46" height="20" rx="10" fill="#2b4dff" />
        <text x="563" y="394" fontFamily={sans} fontSize="11" fontWeight="700" fill="#fffdf7">Omar</text>
      </g>
    </svg>
  );
}
