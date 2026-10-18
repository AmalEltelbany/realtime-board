import Link from "next/link";
import { Logo } from "@/components/ui";
import { DemoButton } from "@/features/auth/demo-button";
import { HeroBoard } from "@/features/landing/hero-board";

const repo = "https://github.com/AmalEltelbany/realtime-board";

const steps = [
  { title: "You drop the card", body: "It moves on your screen instantly. No spinner, no waiting for the server.", tag: "optimistic update", color: "bg-note-yellow" },
  { title: "The server checks it", body: "Role and card version are verified, then one row is written. Stale edits get a 409, never a silent overwrite.", tag: "version 7 → 8", color: "bg-note-sky" },
  { title: "Everyone sees it", body: "The change is broadcast to the board's room, so every open tab updates within milliseconds.", tag: "board:event", color: "bg-note-mint" },
];

const features = [
  { title: "Live for everyone", body: "Moves, edits, new lists and invites reach every viewer over WebSockets.", icon: "⚡" },
  { title: "Drag and drop that feels instant", body: "Optimistic updates with automatic rollback if the server says no.", icon: "✋" },
  { title: "Conflicts are caught", body: "Two people editing one card? The second sees what changed instead of overwriting it.", icon: "🛡" },
  { title: "Roles that hold", body: "Owner, editor and viewer, checked on every request and every socket join.", icon: "🔑" },
  { title: "Presence and activity", body: "See who's on the board right now and what changed, as it happens.", icon: "👀" },
  { title: "Order that never breaks", body: "Fractional positions: a move writes one row, not a whole list.", icon: "↕" },
];

const stack = ["Next.js 16", "NestJS 12", "PostgreSQL", "Socket.IO", "Prisma 7", "TanStack Query", "dnd-kit", "Playwright"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/" aria-label="Realtime Board home"><Logo /></Link>
          <div className="hidden gap-5 text-sm text-muted md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href={repo} className="hover:text-foreground">GitHub</a>
          </div>
          <div className="ms-auto flex items-center gap-2 text-sm">
            <Link className="hidden rounded-full px-3 py-2 font-medium text-muted hover:text-foreground sm:block" href="/login">Sign in</Link>
            <Link className="whitespace-nowrap rounded-full bg-ink px-4 py-2 font-semibold text-ink-foreground hover:opacity-90" href="/register">Sign up free</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="dot-grid">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
                <span className="animate-pulse-ring size-2 rounded-full bg-green-500" /> Real-time collaboration, open source
              </p>
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
                Your team&apos;s board,{" "}
                <span className="relative whitespace-nowrap text-accent">
                  live
                  <svg aria-hidden viewBox="0 0 120 12" className="absolute -bottom-2 start-0 h-3 w-full" preserveAspectRatio="none">
                    <path d="M2 9 C 30 2, 60 2, 118 7" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                in every tab.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted">
                A collaborative Kanban board where every card you move shows up for your teammates instantly. Open the demo in two windows and watch it sync.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <DemoButton className="px-6 py-3 text-base" />
                <a className="rounded-full px-4 py-3 text-sm font-semibold text-muted ring-1 ring-border hover:text-foreground" href={repo}>
                  View the code →
                </a>
              </div>
              <p className="mt-4 text-sm text-muted">No sign-up. You get your own sample board in a second.</p>
            </div>
            <HeroBoard />
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-6 text-sm font-semibold text-muted">
            <span className="text-xs uppercase tracking-widest">Built with</span>
            {stack.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
          <p className="text-sm font-bold uppercase tracking-widest text-accent">How it works</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight">What happens when you drag a card</h2>
          <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
            <span aria-hidden className="absolute start-0 end-0 top-7 hidden border-t-2 border-dashed border-border md:block" />
            {steps.map((step, i) => (
              <li key={step.title} className="relative rounded-3xl border border-border bg-surface p-6">
                <span className={`grid size-14 place-items-center rounded-2xl text-xl font-extrabold text-note-ink ${step.color}`}>{i + 1}</span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-muted">{step.body}</p>
                <code className="mt-4 inline-block rounded-lg bg-surface-muted px-2 py-1 font-mono text-xs">{step.tag}</code>
              </li>
            ))}
          </ol>
        </section>

        <section id="features" className="scroll-mt-20 bg-surface-muted/60">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <p className="text-sm font-bold uppercase tracking-widest text-accent">Features</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight">Small board, serious engineering</h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-lg">
                  <span aria-hidden className="grid size-11 place-items-center rounded-2xl bg-surface-muted text-xl">{f.icon}</span>
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-muted">{f.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid items-center gap-6 rounded-3xl bg-ink p-8 text-ink-foreground md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-extrabold">Two people, one card, no lost work</h3>
                <p className="mt-2 opacity-75">
                  Every card carries a version. If someone else saved first, your edit is rejected and you see their change, with a clear message instead of a silent overwrite.
                </p>
              </div>
              <div aria-hidden className="flex flex-col gap-2 text-sm">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <span className="font-bold text-note-sky">Sara</span> renamed &ldquo;Pricing page&rdquo; <span className="opacity-60">· v4 → v5</span>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <span className="font-bold text-note-yellow">You</span> tried to save an edit made on v4
                </div>
                <div className="rounded-2xl bg-accent px-4 py-3 font-semibold text-accent-foreground">
                  Someone else changed this card. Showing the latest version.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-accent px-8 py-14 text-center text-accent-foreground">
            <span aria-hidden className="absolute -start-6 -top-6 size-24 rotate-12 rounded-2xl bg-note-yellow/80" />
            <span aria-hidden className="absolute -bottom-8 -end-4 size-28 -rotate-12 rounded-2xl bg-note-mint/80" />
            <h2 className="relative text-4xl font-extrabold tracking-tight">Open two windows. Drag a card. Watch.</h2>
            <p className="relative mx-auto mt-3 max-w-md opacity-85">The demo gives you your own sample board. Nothing to install, no account needed.</p>
            <div className="relative mt-8 flex justify-center">
              <DemoButton variant="inverse" label="Start the demo" className="px-6 py-3 text-base" />
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted">
          <Logo className="text-foreground" />
          <span>
            Designed and built by{" "}
            <a className="font-semibold text-accent hover:underline" href="https://portfolio-amaleltelbany.vercel.app">Amal El-Telbany</a>
            {" · "}
            <a className="hover:text-foreground" href={repo}>Source on GitHub</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
