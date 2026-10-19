import Link from "next/link";
import { Avatar, Logo } from "@/components/ui";
import { DemoButton } from "@/features/auth/demo-button";
import { EventTicker, SyncWire } from "@/features/landing/pinboard";

const repo = "https://github.com/AmalEltelbany/realtime-board";

const pill = "rounded-full border border-ink px-4 py-2 text-sm font-semibold transition-colors";

const steps = [
  { event: "drop", title: "You drop the card", body: "It lands on your screen at once. No spinner, no waiting for the server.", color: "bg-lime" },
  { event: "POST /cards/:id/move", title: "The server checks it", body: "Role and card version are verified, then one row is written. A stale edit gets a 409.", color: "bg-sky" },
  { event: "board:event", title: "Every tab updates", body: "The change goes to the board's room and every open tab applies it within milliseconds.", color: "bg-bubblegum" },
];

const stack = ["Next.js 16", "NestJS 12", "PostgreSQL", "Socket.IO", "Prisma 7", "TanStack Query", "dnd-kit", "Playwright"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <EventTicker
        events={[
          "card.upserted → 3 tabs",
          "presence: Omar joined",
          "list.created \"QA\"",
          "409 · stale edit caught",
          "member.added as editor",
          "board:event delivered in 38ms",
        ]}
      />

      <header className="border-b border-ink bg-paper">
        <nav className="mx-auto flex max-w-[1320px] items-center gap-6 px-5 py-3 lg:px-8">
          <Link href="/" aria-label="Realtime Board home"><Logo /></Link>
          <div className="hidden gap-6 text-sm font-semibold md:flex">
            <a href="#how" className="hover:underline hover:decoration-wire hover:decoration-2 hover:underline-offset-4">How it works</a>
            <a href="#features" className="hover:underline hover:decoration-wire hover:decoration-2 hover:underline-offset-4">Features</a>
            <a href={repo} className="hover:underline hover:decoration-wire hover:decoration-2 hover:underline-offset-4">GitHub</a>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Link href="/login" className={`${pill} hidden bg-paper hover:bg-canvas sm:block`}>Sign in</Link>
            <Link href="/register" className={`${pill} whitespace-nowrap bg-ink text-paper hover:bg-paper hover:text-ink`}>Sign up free</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="grid-paper border-b border-ink">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-24">
            <div>
              <p className="tag inline-flex items-center gap-2 rounded-full border border-ink bg-paper px-3 py-1.5">
                <span className="animate-blink size-2 rounded-full bg-wire" /> 2 people on this board
              </p>
              <h1 className="display mt-7 text-[clamp(3.3rem,8.6vw,8.4rem)]">
                Every move,
                <br />
                every tab,
                <br />
                <span className="marker">instantly.</span>
              </h1>
              <p className="mt-7 max-w-md text-lg leading-relaxed">
                A collaborative Kanban board. Drag a card in one window and it moves in the other before you let go.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <DemoButton className="px-6 py-3 text-base" />
                <a href={repo} className={`${pill} bg-paper px-6 py-3 text-base hover:bg-canvas`}>View the code</a>
              </div>
              <p className="tag mt-5 text-muted">No sign-up · your own sample board</p>
            </div>
            <SyncWire className="w-full" />
          </div>
        </section>

        <section id="how" className="scroll-mt-4 border-b border-ink bg-ink text-paper">
          <div className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8">
            <p className="tag text-lime">How it works</p>
            <h2 className="display mt-4 text-[clamp(2.6rem,6.5vw,6rem)]">What happens when<br />you drag a card</h2>
            <ol className="relative mt-16 grid gap-6 md:grid-cols-3">
              <span aria-hidden className="absolute start-[8%] end-[8%] top-9 hidden h-1 rounded-full bg-wire md:block" />
              {steps.map((step, i) => (
                <li key={step.title} className={`pinned relative rounded-[20px] border border-paper p-6 text-ink ${step.color}`} style={{ boxShadow: "4px 4px 0 var(--paper)" }}>
                  <span aria-hidden className="absolute -top-2.5 start-1/2 size-5 -translate-x-1/2 rounded-full border-2 border-ink bg-wire" />
                  <span className="tag rounded-full border border-ink bg-paper px-2.5 py-1">{step.event}</span>
                  <p className="display mt-6 text-6xl">0{i + 1}</p>
                  <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="scroll-mt-4 border-b border-ink bg-paper">
          <div className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8">
            <p className="tag text-muted">Features</p>
            <h2 className="display mt-4 text-[clamp(2.6rem,6.5vw,6rem)]">Small board.<br />Serious engineering.</h2>

            <div className="mt-14 grid gap-5 md:grid-cols-6">
              <article className="pinned rounded-[20px] border border-ink bg-sky p-7 md:col-span-4">
                <h3 className="display text-4xl">Live for everyone</h3>
                <p className="mt-2 max-w-md">Moves, edits, new lists and invites reach every viewer over WebSockets, with presence so you know who&apos;s here.</p>
                <div aria-hidden className="mt-6 rounded-2xl border border-ink bg-paper p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex -space-x-2"><Avatar name="Amal E" /><Avatar name="Omar K" /><Avatar name="Sara M" /></span>
                    <span className="text-sm font-semibold">Amal, Omar and Sara are here</span>
                  </div>
                  <ul className="tag mt-4 flex flex-col gap-2 text-muted">
                    <li><span className="text-ink">Omar</span> moved &ldquo;Ship v1&rdquo; to Doing · now</li>
                    <li><span className="text-ink">Sara</span> added &ldquo;QA pass&rdquo; · 12s</li>
                    <li><span className="text-ink">Amal</span> invited a viewer · 1m</li>
                  </ul>
                </div>
              </article>

              <article className="pinned rounded-[20px] border border-ink bg-lime p-7 md:col-span-2">
                <h3 className="display text-4xl">Conflicts get caught</h3>
                <p className="mt-2">Every card has a version. If someone saved first, you see their change instead of overwriting it.</p>
                <p aria-hidden className="tag mt-6 inline-flex rounded-full border border-ink bg-paper px-3 py-1.5">409 · v4 is stale, v5 wins</p>
              </article>

              <article className="pinned rounded-[20px] border border-ink bg-bubblegum p-7 md:col-span-2">
                <h3 className="display text-3xl">Drag and drop that feels instant</h3>
                <p className="mt-2">Optimistic updates, with rollback if the server says no.</p>
              </article>

              <article className="pinned rounded-[20px] border border-ink bg-sand p-7 md:col-span-2">
                <h3 className="display text-3xl">Order that never breaks</h3>
                <p className="mt-2">Fractional positions: a move writes one row, not the whole list.</p>
                <p aria-hidden className="tag mt-5 flex gap-2">
                  <span className="rounded-md border border-ink bg-paper px-2 py-1">a0</span>
                  <span className="rounded-md border border-ink bg-lime px-2 py-1">a0V</span>
                  <span className="rounded-md border border-ink bg-paper px-2 py-1">a1</span>
                </p>
              </article>

              <article className="pinned rounded-[20px] border border-ink bg-paper p-7 md:col-span-2">
                <h3 className="display text-3xl">Roles that hold</h3>
                <p className="mt-2">Owner, editor and viewer, checked on every request and every socket join.</p>
              </article>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-2">
              <span className="tag me-2 text-muted">Built with</span>
              {stack.map((item) => (
                <span key={item} className="rounded-full border border-ink bg-canvas px-3 py-1 text-sm font-semibold">{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-ink bg-lime">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-8 px-5 py-20 lg:px-8">
            <h2 className="display text-[clamp(2.8rem,7.5vw,7rem)]">Bring a friend.<br />Drag a card.</h2>
            <div className="flex flex-col items-start gap-3">
              <DemoButton variant="inverse" label="Start the demo" className="px-6 py-3 text-base" />
              <p className="tag">Opens your own board · nothing to install</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto bg-ink text-paper">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm lg:px-8">
          <Logo />
          <span>
            Designed and built by{" "}
            <a className="font-bold underline decoration-wire decoration-2 underline-offset-4" href="https://portfolio-amaleltelbany.vercel.app">Amal El-Telbany</a>
            {" · "}
            <a className="underline underline-offset-4" href={repo}>Source on GitHub</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
