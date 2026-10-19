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
      <header className="border-b border-ink bg-paper">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-3 lg:px-10">
          <Link href="/" aria-label="Realtime Board home"><Logo /></Link>
          <div className="ms-auto flex items-center gap-2 text-sm">
            {session.data && (
              <span className="flex items-center gap-2 rounded-full border border-ink py-1 pe-3 ps-1 font-bold">
                <Avatar name={session.data.name} size="sm" /> {session.data.name}
              </span>
            )}
            <Button variant="secondary" onClick={() => logout.mutate()}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="grid-paper flex-1">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="display text-[clamp(3.5rem,8vw,6.5rem)]">Your boards</h1>
              <p className="mt-4 text-lg">Open one in two windows to see live updates.</p>
            </div>
            <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New board name" maxLength={100} />
              <Button type="submit" disabled={!title.trim() || create.isPending} className="shrink-0">Create board</Button>
            </form>
          </div>

          {boards.isPending && <p className="mt-12 text-sm">Loading boards…</p>}
          {boards.isError && <p className="mt-12 text-sm text-danger">{boards.error.message}</p>}
          {boards.data?.length === 0 && (
            <div className="mt-12 rounded-[20px] border border-dashed border-ink bg-paper p-12 text-center">
              <p className="display text-4xl">No boards yet</p>
              <p className="mt-3">Create your first one above.</p>
            </div>
          )}

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boards.data?.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/boards/${board.id}`}
                  className="pinned pinned-hover group block overflow-hidden rounded-[20px] border border-ink bg-paper"
                >
                  <div aria-hidden className={`flex h-28 items-end gap-2 border-b border-ink p-4 ${noteColor(board.id)}`}>
                    <span className="h-14 w-1/3 rounded-2xl border border-ink bg-paper" />
                    <span className="h-20 w-1/3 rounded-2xl border border-ink bg-paper" />
                    <span className="h-10 w-1/3 rounded-2xl border border-ink bg-paper" />
                  </div>
                  <div className="p-5">
                    <span className="text-xl font-bold">{board.title}</span>
                    <span className="mt-2 flex items-center gap-2 text-xs">
                      <span className="tag rounded-full border border-ink px-2.5 py-0.5 uppercase">{board.role.toLowerCase()}</span>
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
