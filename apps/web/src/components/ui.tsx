import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// The main action is lime and casts a hard shadow, like a card pinned to the board.
const buttonVariants = {
  primary: "bg-lime text-ink border border-ink pinned pinned-hover",
  secondary: "bg-paper text-ink border border-ink hover:bg-canvas",
  ghost: "border border-transparent text-ink hover:border-ink",
  danger: "border border-ink bg-paper text-danger hover:bg-canvas",
  inverse: "bg-ink text-paper border border-ink hover:bg-paper hover:text-ink",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-ink bg-paper px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:ring-4 focus:ring-lime ${className}`}
      {...props}
    />
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {children}
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

/** Sticker colours for lists and avatars, picked by position or a stable id. All take ink text. */
export const noteColors = ["bg-lime", "bg-bubblegum", "bg-sky", "bg-tangerine", "bg-sand"] as const;

export function noteColor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return noteColors[Math.abs(hash) % noteColors.length];
}

export function Avatar({ name, title, size = "md" }: { name: string; title?: string; size?: "sm" | "md" }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      title={title ?? name}
      className={`inline-flex items-center justify-center rounded-full border border-ink font-bold text-ink ${noteColor(name)} ${size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs"}`}
    >
      {initials}
    </span>
  );
}

/** A pinned tile with three lists and the red "live" pin. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect x="6" y="9" width="50" height="50" rx="12" fill="#141210" />
      <rect x="3" y="5" width="50" height="50" rx="12" fill="#fffdf7" stroke="#141210" strokeWidth="3" />
      <rect x="12" y="15" width="9" height="30" rx="3" fill="#c9f23e" stroke="#141210" strokeWidth="2.5" />
      <rect x="24" y="15" width="9" height="21" rx="3" fill="#ffa6d6" stroke="#141210" strokeWidth="2.5" />
      <rect x="36" y="15" width="9" height="13" rx="3" fill="#a8d4ff" stroke="#141210" strokeWidth="2.5" />
      <circle cx="47" cy="44" r="5" fill="#ff3d2e" stroke="#141210" strokeWidth="2.5" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap ${className}`}>
      <LogoMark />
      <span className="display text-[22px] leading-none">Realtime Board</span>
    </span>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="pinned w-full max-w-lg rounded-[22px] border border-ink bg-paper p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="display text-4xl">{title}</h2>
          <Button variant="secondary" className="size-9 px-0" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
