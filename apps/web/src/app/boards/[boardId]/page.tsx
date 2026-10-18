import { Suspense } from "react";
import { BoardScreen } from "@/features/boards/board-screen";

export default function BoardPage({ params }: PageProps<"/boards/[boardId]">) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Loading board…</p>}>
      {params.then(({ boardId }) => (
        <BoardScreen boardId={boardId} />
      ))}
    </Suspense>
  );
}
