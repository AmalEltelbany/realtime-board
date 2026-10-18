"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your boards</h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          {session.data && <span>{session.data.name}</span>}
          <Button variant="ghost" onClick={() => logout.mutate()}>Sign out</Button>
        </div>
      </header>

      <form onSubmit={onSubmit} className="mt-8 flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New board name" maxLength={100} />
        <Button type="submit" disabled={!title.trim() || create.isPending}>Create board</Button>
      </form>

      {boards.isPending && <p className="mt-8 text-sm text-muted">Loading boards…</p>}
      {boards.isError && <p className="mt-8 text-sm text-danger">{boards.error.message}</p>}
      {boards.data?.length === 0 && <p className="mt-8 text-sm text-muted">No boards yet. Create your first one above.</p>}

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {boards.data?.map((board) => (
          <li key={board.id}>
            <Link
              href={`/boards/${board.id}`}
              className="block rounded-xl border border-border bg-surface p-5 transition hover:border-accent"
            >
              <span className="font-medium">{board.title}</span>
              <span className="mt-1 block text-xs text-muted">
                {board.role.toLowerCase()} · updated {new Date(board.updatedAt).toLocaleString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
