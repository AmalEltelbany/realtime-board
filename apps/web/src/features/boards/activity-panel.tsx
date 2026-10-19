"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui";
import { boardKeys, boardsApi } from "./boards-api";

export function ActivityPanel({ boardId }: { boardId: string }) {
  const activity = useQuery({ queryKey: boardKeys.activity(boardId), queryFn: () => boardsApi.activity(boardId) });
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-s border-ink bg-paper p-4" aria-label="Activity">
      <h2 className="display mb-5 text-2xl">Activity</h2>
      {activity.isPending && <p className="text-xs text-muted">Loading…</p>}
      {activity.data?.length === 0 && <p className="text-xs text-muted">Changes to this board will show up here as they happen.</p>}
      <ol className="flex flex-col gap-3">
        {activity.data?.map((item) => (
          <li key={item.id} className="flex gap-2.5 text-xs">
            <Avatar name={item.actor.name} size="sm" />
            <span>
              <span className="font-bold">{item.actor.name}</span> {item.summary}
              <time className="block text-muted" dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
