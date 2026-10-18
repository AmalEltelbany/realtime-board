"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import type { BoardDto } from "@board/shared";
import { Avatar, Button, Field, Input, Modal } from "@/components/ui";
import { boardKeys, boardsApi } from "./boards-api";
import { applyBoardEvent } from "./board-state";

export function InviteDialog({ board, onClose }: { board: BoardDto; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const invite = useMutation({
    mutationFn: () => boardsApi.invite(board.id, email, role),
    onSuccess: (member) => {
      queryClient.setQueryData<BoardDto>(boardKeys.detail(board.id), (b) => (b ? applyBoardEvent(b, { type: "member.added", member }) : b));
      setEmail("");
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    invite.mutate();
  }

  return (
    <Modal title="Share board" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Email of a registered user" error={invite.error?.message}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
            className="rounded-full border border-carbon bg-paper px-3 text-sm font-bold"
            aria-label="Role"
          >
            <option value="EDITOR">Can edit</option>
            <option value="VIEWER">Can view</option>
          </select>
          <Button type="submit" className="flex-1" disabled={!email || invite.isPending}>Invite</Button>
        </div>
      </form>
      <ul className="mt-6 flex flex-col gap-2">
        {board.members.map((m) => (
          <li key={m.user.id} className="flex items-center gap-3 text-sm">
            <Avatar name={m.user.name} />
            <span className="flex-1">{m.user.name} <span className="text-muted">{m.user.email}</span></span>
            <span className="label rounded-full border border-carbon px-2 py-0.5 text-[10px] uppercase">{m.role.toLowerCase()}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
