import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui";
import { DemoButton } from "@/features/auth/demo-button";
import { TwoTabs } from "@/features/landing/hero-board";
import { Marquee, Ribbon, Sticker } from "@/features/landing/stickers";

const repo = "https://github.com/AmalEltelbany/realtime-board";

const pill = "label rounded-full border border-carbon px-4 py-2.5 text-[13px] transition-colors";

const steps = [
  { title: "You drop the card", body: "It moves on your screen at once. No spinner, no waiting for the server.", tag: "optimistic update", fill: "bg-sunburst" },
  { title: "The server checks it", body: "Your role and the card's version are verified, then one row is written. A stale edit gets a 409, never a silent overwrite.", tag: "version 7 → 8", fill: "bg-lavender" },
  { title: "Everyone sees it", body: "The change is broadcast to the board's room, and every open tab updates within milliseconds.", tag: "board:event", fill: "bg-mint-pop" },
];

const features: { title: string; body: string; fill: string; icon: ReactNode }[] = [
  { title: "Live for everyone", body: "Moves, edits, new lists and invites reach every viewer over WebSockets.", fill: "bg-electric-blue", icon: <path d="M13 2 4 14h7l-1 8 9-12h-7z" /> },
  { title: "Instant drag and drop", body: "Optimistic updates, with automatic rollback if the server says no.", fill: "bg-sunburst", icon: <path d="M7 11V5a2 2 0 0 1 4 0v5m0 0V4a2 2 0 0 1 4 0v6m0 0V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l2 2" /> },
  { title: "Conflicts are caught", body: "Two people editing one card? The second sees what changed instead of overwriting it.", fill: "bg-ember", icon: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /> },
  { title: "Roles that hold", body: "Owner, editor and viewer, checked on every request and every socket join.", fill: "bg-lavender", icon: <path d="M15 7a4 4 0 1 1-4 4l-7 7v3h3v-2h2v-2h2l1.5-1.5A4 4 0 0 1 15 7z" /> },
  { title: "Presence and activity", body: "See who's on the board right now, and what changed, as it happens.", fill: "bg-mint-pop", icon: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
  { title: "Order that never breaks", body: "Fractional positions: a move writes one row, not the whole list.", fill: "bg-paper", icon: <path d="M8 4v16m0 0-4-4m4 4 4-4M16 20V4m0 0-4 4m4-4 4 4" /> },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Marquee items={["Live Kanban for teams", "Drag a card, watch it move in every tab", "WebSockets", "Conflict-safe edits", "Open source"]} />

      <header className="border-b border-carbon bg-paper">
        <nav className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-3 lg:px-10">
          <Link href="/" aria-label="Realtime Board home"><Logo /></Link>
          <div className="mx-auto hidden gap-1 md:flex">
            <a href="#how" className={`${pill} hover:bg-sunburst`}>How it works</a>
            <a href="#features" className={`${pill} hover:bg-lavender`}>Features</a>
            <a href={repo} className={`${pill} hover:bg-mint-pop`}>GitHub</a>
          </div>
          <div className="ms-auto flex items-center gap-1 md:ms-0">
            <Link href="/login" className={`${pill} hidden bg-paper hover:bg-sky-wash sm:block`}>Sign in</Link>
            <Link href="/register" className={`${pill} whitespace-nowrap bg-carbon text-paper hover:bg-paper hover:text-carbon`}>Sign up</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-carbon bg-sky-wash">
          <Ribbon className="inset-x-0 top-[24%] hidden h-[42%] w-full sm:block" />
          <div className="relative mx-auto max-w-[1440px] px-5 pb-24 pt-16 lg:px-10 lg:pb-32 lg:pt-24">
            <h1 className="display relative z-10 text-[clamp(3.2rem,12.5vw,12.5rem)]">
              Plan it.
              <br />
              Move it.
              <br />
              <span className="ms-[8vw]">Live.</span>
            </h1>

            <Sticker className="end-[6%] top-[10%] rotate-6 bg-ember px-4 py-2">
              <span className="label flex items-center gap-2 text-sm uppercase">
                <span className="size-2.5 rounded-full border border-carbon bg-paper" /> Live
              </span>
            </Sticker>
            <Sticker className="end-[16%] top-[34%] hidden w-44 -rotate-3 bg-sunburst p-3 sm:block">
              <span className="block h-1.5 w-10 rounded-full bg-carbon" />
              <span className="mt-2 block text-sm font-bold">Ship v1</span>
              <span className="text-xs">moved to Doing</span>
            </Sticker>
            <Sticker className="end-[5%] top-[52%] hidden rotate-[8deg] bg-lavender px-3 py-2 md:block">
              <span className="flex items-center gap-1.5 text-sm font-bold">
                <svg viewBox="0 0 16 16" className="size-4"><path d="M1 1l5.5 13 2-5.5L14 6.5z" fill="#000" /></svg>
                Omar is here
              </span>
            </Sticker>
            <Sticker className="start-[56%] top-[6%] hidden size-16 -rotate-12 place-items-center rounded-full bg-mint-pop lg:grid">
              <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="#000" strokeWidth="3"><path d="m5 12 5 5 9-10" /></svg>
            </Sticker>

            <div className="relative z-10 mt-12 max-w-xl">
              <p className="text-2xl font-medium leading-tight">
                A collaborative Kanban board. Drag a card in one window and watch it move in the other.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <DemoButton className="px-6 py-3.5 text-sm" />
                <a href={repo} className={`${pill} bg-paper px-6 py-3.5 text-sm hover:bg-sunburst`}>View the code</a>
              </div>
              <p className="mt-4 text-sm">No sign-up. You get your own sample board.</p>
            </div>
          </div>
        </section>

        <section className="border-b border-carbon bg-paper">
          <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="display text-[clamp(2.1rem,8vw,7rem)]">One board,<br />two tabs</h2>
              <p className="max-w-sm text-lg">Same board, open in two browsers. The card you drop shows up in the other one before you let go of the mouse.</p>
            </div>
            <div className="mt-14"><TwoTabs /></div>
          </div>
        </section>

        <section id="how" className="scroll-mt-4 border-b border-carbon bg-concrete">
          <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10">
            <h2 className="display text-[clamp(2.1rem,8vw,7rem)]">How a move<br />travels</h2>
            <ol className="mt-14 grid gap-5 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title} className={`rounded-[30px] border border-carbon p-7 ${step.fill}`}>
                  <span className="display block text-8xl">{i + 1}</span>
                  <h3 className="mt-8 text-2xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed">{step.body}</p>
                  <code className="mt-6 inline-block rounded-full border border-carbon bg-paper px-3 py-1 font-mono text-xs">{step.tag}</code>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="scroll-mt-4 border-b border-carbon bg-paper">
          <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10">
            <h2 className="display text-[clamp(2.1rem,8vw,7rem)]">Small board.<br />Serious engineering.</h2>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-[20px] border border-carbon bg-paper p-6 transition-colors hover:bg-sky-wash">
                  <span className={`grid size-12 place-items-center rounded-2xl border border-carbon ${f.fill}`}>
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-carbon bg-sky-wash">
          <div className="mx-auto grid max-w-[1440px] gap-0 px-5 py-24 lg:grid-cols-2 lg:px-10">
            <div className="rounded-t-[30px] border border-carbon bg-voltage-violet p-8 text-paper lg:rounded-s-[30px] lg:rounded-tr-none lg:p-12">
              <h2 className="display text-5xl sm:text-6xl">No lost work</h2>
              <p className="mt-6 max-w-md text-lg">
                Every card carries a version. If someone else saved first, your edit is rejected and you see their change, with a clear message instead of a silent overwrite.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 rounded-b-[30px] border border-t-0 border-carbon bg-paper p-8 lg:rounded-e-[30px] lg:rounded-bl-none lg:border-s-0 lg:border-t lg:p-12">
              <p className="rounded-2xl border border-carbon px-4 py-3 text-sm"><b>Sara</b> renamed &ldquo;Pricing page&rdquo; · v4 → v5</p>
              <p className="rounded-2xl border border-carbon px-4 py-3 text-sm"><b>You</b> tried to save an edit made on v4</p>
              <p className="rounded-2xl border border-carbon bg-sunburst px-4 py-3 text-sm font-bold">Someone else changed this card. Showing the latest version.</p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-paper">
          <div className="relative mx-auto max-w-[1440px] px-5 py-28 text-center lg:px-10">
            <Sticker className="start-[8%] top-12 hidden size-20 -rotate-12 bg-sunburst md:block"><span /></Sticker>
            <Sticker className="end-[10%] top-20 hidden size-16 rotate-12 rounded-full bg-ember md:block"><span /></Sticker>
            <Sticker className="bottom-14 end-[22%] hidden size-14 -rotate-6 bg-mint-pop md:block"><span /></Sticker>
            <h2 className="display text-[clamp(3rem,11vw,10rem)]">Drag. Drop.<br />Done.</h2>
            <p className="mx-auto mt-8 max-w-md text-xl">Open the demo in two windows and drag a card. Nothing to install.</p>
            <div className="mt-8 flex justify-center">
              <DemoButton label="Start the demo" className="px-6 py-3.5 text-sm" />
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto bg-carbon text-paper">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm lg:px-10">
          <Logo />
          <span>
            Designed and built by{" "}
            <a className="font-bold underline underline-offset-4" href="https://portfolio-amaleltelbany.vercel.app">Amal El-Telbany</a>
            {" · "}
            <a className="underline underline-offset-4" href={repo}>Source on GitHub</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
