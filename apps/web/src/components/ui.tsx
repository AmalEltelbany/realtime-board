import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const buttonVariants = {
  primary: "bg-accent text-accent-foreground shadow-[0_2px_0_rgba(0,0,0,0.12)] hover:-translate-y-px hover:shadow-[0_4px_0_rgba(0,0,0,0.12)]",
  secondary: "bg-surface text-foreground ring-1 ring-border hover:bg-surface-muted",
  ghost: "text-muted hover:text-foreground hover:bg-surface-muted",
  danger: "text-danger hover:bg-surface-muted",
  inverse: "bg-ink text-ink-foreground hover:opacity-90",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15 ${className}`}
      {...props}
    />
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error && <span className="text-xs font-normal text-danger">{error}</span>}
    </label>
  );
}

/** Sticky-note colours, picked deterministically from an id so a list keeps its colour everywhere. */
export const noteColors = ["bg-note-yellow", "bg-note-mint", "bg-note-sky", "bg-note-pink", "bg-note-lilac", "bg-note-orange"] as const;

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
      className={`inline-flex items-center justify-center rounded-full border-2 border-surface font-bold text-note-ink ${noteColor(name)} ${size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs"}`}
    >
      {initials}
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap font-bold tracking-tight ${className}`}>
      <span aria-hidden className="grid size-7 grid-cols-3 gap-0.5 rounded-lg bg-ink p-1.5">
        <span className="rounded-sm bg-note-yellow" />
        <span className="rounded-sm bg-accent" style={{ height: "70%" }} />
        <span className="rounded-sm bg-note-mint" style={{ height: "45%" }} />
      </span>
      Realtime Board
    </span>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" className="px-2.5" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
