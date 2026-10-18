"use client";

import { useQuery } from "@tanstack/react-query";
import { boardKeys, boardsApi } from "./boards-api";

export function ActivityPanel({ boardId }: { boardId: string }) {
  const activity = useQuery({ queryKey: boardKeys.activity(boardId), queryFn: () => boardsApi.activity(boardId) });
  return (
    <aside className="w-72 shrink-0 border-s border-border p-4" aria-label="Activity">
      <h2 className="mb-3 text-sm font-semibold">Activity</h2>
      {activity.isPending && <p className="text-xs text-muted">Loading…</p>}
      <ol className="flex flex-col gap-3">
        {activity.data?.map((item) => (
          <li key={item.id} className="text-xs">
            <span className="font-medium">{item.actor.name}</span> {item.summary}
            <time className="block text-muted" dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </time>
          </li>
        ))}
      </ol>
    </aside>
  );
}
