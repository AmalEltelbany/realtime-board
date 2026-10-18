import Link from "next/link";
import { DemoButton } from "@/features/auth/demo-button";

const features = [
  { title: "Live for everyone", body: "Moves, edits and new cards show up for every teammate within milliseconds, over WebSockets." },
  { title: "Instant drag and drop", body: "The UI updates before the server answers, then reconciles. Conflicts are detected, never silently overwritten." },
  { title: "Roles that hold", body: "Owners, editors and viewers. Every request is checked on the server, not just hidden in the UI." },
  { title: "See who's here", body: "Presence avatars show who is looking at the board right now, and an activity feed shows what changed." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
      <header className="flex items-center justify-between">
        <span className="font-semibold">▦ Realtime Board</span>
        <nav className="flex gap-2 text-sm">
          <Link className="rounded-lg px-3 py-2 text-muted hover:text-foreground" href="/login">Sign in</Link>
          <Link className="rounded-lg bg-surface px-3 py-2 ring-1 ring-border hover:bg-surface-muted" href="/register">Sign up</Link>
        </nav>
      </header>

      <section className="mt-24 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Plan together, in real time.</h1>
        <p className="mt-5 text-lg text-muted">
          A collaborative Kanban board. Open the demo in two windows and drag a card: it moves in both.
        </p>
        <div className="mt-8 flex flex-wrap items-start gap-3">
          <DemoButton />
          <Link className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted hover:text-foreground" href="https://github.com/AmalEltelbany/realtime-board">
            View the code →
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-medium">{f.title}</h2>
            <p className="mt-1.5 text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-auto pt-16 text-sm text-muted">
        Built with Next.js, NestJS, PostgreSQL, Prisma and Socket.IO by{" "}
        <a className="text-accent hover:underline" href="https://portfolio-amaleltelbany.vercel.app">Amal El-Telbany</a>.
      </footer>
    </main>
  );
}
