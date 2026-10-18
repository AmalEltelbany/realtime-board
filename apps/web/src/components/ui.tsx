import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// Actions are black-filled or black-outlined pills, never a brand colour.
const buttonVariants = {
  primary: "bg-carbon text-paper border border-carbon hover:bg-paper hover:text-carbon",
  secondary: "bg-paper text-carbon border border-carbon hover:bg-sky-wash",
  ghost: "border border-transparent text-carbon hover:border-carbon",
  danger: "border border-carbon bg-paper text-danger hover:bg-mist",
  inverse: "bg-paper text-carbon border border-carbon hover:bg-sunburst",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`label inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-full border border-carbon bg-paper px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:bg-sky-wash ${className}`}
      {...props}
    />
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold">
      {label}
      {children}
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

/** The sticker palette, minus violet (which needs white text). Picked by position or a stable id. */
export const noteColors = ["bg-sunburst", "bg-mint-pop", "bg-lavender", "bg-electric-blue", "bg-ember"] as const;

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
      className={`inline-flex items-center justify-center rounded-full border border-carbon font-bold text-carbon ${noteColor(name)} ${size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs"}`}
    >
      {initials}
    </span>
  );
}

/** Circular black-outlined badge with three sticker bars: the board, in miniature. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <circle cx="32" cy="32" r="30" fill="#fff" stroke="#000" strokeWidth="2.5" />
      <rect x="17" y="18" width="8" height="28" rx="4" fill="#ffd731" stroke="#000" strokeWidth="2" />
      <rect x="28" y="18" width="8" height="20" rx="4" fill="#fb4903" stroke="#000" strokeWidth="2" />
      <rect x="39" y="18" width="8" height="13" rx="4" fill="#55db9c" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-bold tracking-tight ${className}`}>
      <LogoMark />
      Realtime Board
    </span>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-carbon/30 px-4 pt-24"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-[30px] border border-carbon bg-paper p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="display text-3xl">{title}</h2>
          <Button variant="secondary" className="size-9 px-0" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
