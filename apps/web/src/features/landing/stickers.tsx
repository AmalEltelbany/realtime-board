import type { ReactNode } from "react";

/** Full-bleed black strip with a repeating message: the system's only motion. */
export function Marquee({ items }: { items: string[] }) {
  const run = [...items, ...items, ...items, ...items];
  return (
    <div aria-hidden className="overflow-hidden border-b border-carbon bg-carbon py-2 text-paper">
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
        {[...run, ...run].map((item, i) => (
          <span key={i} className="label text-xs uppercase">
            {item} <span className="ms-8">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** A flat cut-out: solid fill, 1px black outline, rounded, slightly rotated. Never grid-aligned. */
export function Sticker({ className, children }: { className: string; children: ReactNode }) {
  return <div aria-hidden className={`absolute rounded-[20px] border border-carbon ${className}`}>{children}</div>;
}

/**
 * The signature motif: a fat inflatable tube in Electric Blue that the display type sits on.
 * Grain comes from an SVG noise filter so the tube reads as a physical object, not a flat stroke.
 */
export function Ribbon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1200 520" preserveAspectRatio="none" className={`pointer-events-none absolute ${className}`}>
      <defs>
        <filter id="ribbon-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="speckle">
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
          <feComposite in="speckle" in2="SourceGraphic" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#ribbon-grain)">
        <path
          d="M-60 420 C 160 120, 420 110, 560 280 S 900 470, 1010 250 S 1180 40, 1280 120"
          fill="none"
          stroke="#000"
          strokeWidth="132"
          strokeLinecap="round"
        />
        <path
          d="M-60 420 C 160 120, 420 110, 560 280 S 900 470, 1010 250 S 1180 40, 1280 120"
          fill="none"
          stroke="#4da2ff"
          strokeWidth="128"
          strokeLinecap="round"
        />
        {/* A lighter crease along the tube gives it the inflated look without a gradient. */}
        <path
          d="M-60 396 C 160 96, 420 86, 560 256 S 900 446, 1010 226 S 1180 16, 1280 96"
          fill="none"
          stroke="#8fc4ff"
          strokeWidth="22"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
