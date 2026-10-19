"use client";

import { useState, type FormEvent } from "react";
import type { CardDto } from "@board/shared";
import { Button, Field, Input, Modal } from "@/components/ui";

interface Props {
  card: CardDto;
  canEdit: boolean;
  onSave: (patch: { title: string; description: string; version: number }) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function CardDialog({ card, canEdit, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  // Someone else saved while this dialog was open: their version wins unless the user saves on top deliberately.
  const changedElsewhere = useStaleWarning(card);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({ title: title.trim(), description, version: card.version });
    onClose();
  }

  return (
    <Modal title={canEdit ? "Edit card" : card.title} onClose={onClose}>
      {changedElsewhere && (
        <p className="mb-4 rounded-2xl border border-ink bg-lime px-4 py-3 text-sm font-semibold">
          Someone just changed this card.{" "}
          <button
            type="button"
            className="font-bold underline underline-offset-4"
            onClick={() => {
              setTitle(card.title);
              setDescription(card.description);
            }}
          >
            Load their version
          </button>
        </p>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} maxLength={200} required />
        </Field>
        <Field label="Notes">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canEdit}
            rows={6}
            maxLength={5000}
            className="w-full rounded-2xl border border-ink bg-paper px-4 py-3 text-sm outline-none focus:bg-canvas"
          />
        </Field>
        {canEdit && (
          <div className="flex justify-between">
            <Button type="button" variant="danger" onClick={() => { onDelete(); onClose(); }}>Delete card</Button>
            <Button type="submit" disabled={!title.trim()}>Save</Button>
          </div>
        )}
      </form>
    </Modal>
  );
}

function useStaleWarning(card: CardDto) {
  const [openedAt] = useState(card.version);
  return card.version !== openedAt;
}
