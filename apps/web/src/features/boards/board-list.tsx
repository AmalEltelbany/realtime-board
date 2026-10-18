"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Input, Logo, noteColor } from "@/components/ui";
import { useLogout, useSession } from "../auth/use-session";
import { boardKeys, boardsApi } from "./boards-api";

export function BoardList() {
  const router = useRouter();
  const session = useSession();
  const logout = useLogout();
  const boards = useQuery({ queryKey: boardKeys.all, queryFn: boardsApi.list });
  const [title, setTitle] = useState("");
  const create = useMutation({
    mutationFn: boardsApi.create,
    onSuccess: (board) => router.push(`/boards/${board.id}`),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (title.trim()) create.mutate(title.trim());
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" aria-label="Realtime Board home"><Logo /></Link>
          <div className="ms-auto flex items-center gap-2 text-sm text-muted">
            {session.data && (
              <span className="flex items-center gap-2 rounded-full bg-surface-muted py-1 pe-3 ps-1">
                <Avatar name={session.data.name} size="sm" /> {session.data.name}
              </span>
            )}
            <Button variant="ghost" onClick={() => logout.mutate()}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="dot-grid flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Your boards</h1>
          <p className="mt-2 text-muted">Open one in two windows to see live updates.</p>

          <form onSubmit={onSubmit} className="mt-8 flex max-w-xl gap-2 rounded-full border border-border bg-surface p-1.5 shadow-sm">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New board name"
              maxLength={100}
              className="border-0 bg-transparent focus:ring-0"
            />
            <Button type="submit" disabled={!title.trim() || create.isPending} className="shrink-0">Create board</Button>
          </form>

          {boards.isPending && <p className="mt-10 text-sm text-muted">Loading boards…</p>}
          {boards.isError && <p className="mt-10 text-sm text-danger">{boards.error.message}</p>}
          {boards.data?.length === 0 && (
            <div className="mt-10 rounded-3xl border-2 border-dashed border-border bg-surface/70 p-10 text-center">
              <p className="text-lg font-bold">No boards yet</p>
              <p className="mt-1 text-muted">Create your first one above.</p>
            </div>
          )}

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.data?.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/boards/${board.id}`}
                  className="group block overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div aria-hidden className={`flex h-24 items-end gap-2 p-4 ${noteColor(board.id)}`}>
                    <span className="h-12 w-1/3 rounded-xl bg-white/60" />
                    <span className="h-16 w-1/3 rounded-xl bg-white/60" />
                    <span className="h-9 w-1/3 rounded-xl bg-white/60" />
                  </div>
                  <div className="p-5">
                    <span className="text-lg font-bold group-hover:text-accent">{board.title}</span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 font-semibold capitalize">{board.role.toLowerCase()}</span>
                      updated {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
