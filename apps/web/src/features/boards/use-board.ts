"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { BoardDto, CardDto, MoveCardInput } from "@board/shared";
import { ApiError } from "@/lib/api-client";
import { boardKeys, boardsApi } from "./boards-api";
import { applyBoardEvent, upsertCard } from "./board-state";

export function useBoard(boardId: string) {
  return useQuery({ queryKey: boardKeys.detail(boardId), queryFn: () => boardsApi.get(boardId) });
}

/**
 * Board writes. Moves apply optimistically; everything reconciles with the server response,
 * and a 409 (someone else got there first) refetches instead of overwriting their change.
 */
export function useBoardMutations(boardId: string) {
  const queryClient = useQueryClient();
  const key = boardKeys.detail(boardId);
  const [notice, setNotice] = useState<string | null>(null);

  const update = (fn: (board: BoardDto) => BoardDto) =>
    queryClient.setQueryData<BoardDto>(key, (board) => (board ? fn(board) : board));
  const saveCard = (card: CardDto) => update((board) => upsertCard(board, card));

  const onConflict = (error: Error) => {
    if (error instanceof ApiError && error.status === 409) {
      setNotice(error.message);
      void queryClient.invalidateQueries({ queryKey: key });
      return;
    }
    setNotice(error.message);
  };

  const moveCard = useMutation({
    mutationFn: ({ cardId, input }: { cardId: string; input: MoveCardInput; optimistic: BoardDto }) =>
      boardsApi.moveCard(cardId, input),
    onMutate: async ({ optimistic }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardDto>(key);
      queryClient.setQueryData(key, optimistic);
      return { previous };
    },
    onSuccess: saveCard,
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      onConflict(error);
    },
  });

  const createCard = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) => boardsApi.createCard(listId, title),
    onSuccess: saveCard,
    onError: onConflict,
  });

  const updateCard = useMutation({
    mutationFn: ({ cardId, ...patch }: { cardId: string; title?: string; description?: string; version: number }) =>
      boardsApi.updateCard(cardId, patch),
    onSuccess: saveCard,
    onError: onConflict,
  });

  const deleteCard = useMutation({
    mutationFn: (cardId: string) => boardsApi.deleteCard(cardId),
    onSuccess: (_, cardId) => update((board) => applyBoardEvent(board, { type: "card.deleted", cardId })),
    onError: onConflict,
  });

  const createList = useMutation({
    mutationFn: (title: string) => boardsApi.createList(boardId, title),
    onSuccess: (list) => update((board) => applyBoardEvent(board, { type: "list.upserted", list })),
    onError: onConflict,
  });

  const renameList = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) => boardsApi.renameList(listId, title),
    onSuccess: (list) => update((board) => applyBoardEvent(board, { type: "list.upserted", list })),
    onError: onConflict,
  });

  const deleteList = useMutation({
    mutationFn: (listId: string) => boardsApi.deleteList(listId),
    onSuccess: (_, listId) => update((board) => applyBoardEvent(board, { type: "list.deleted", listId })),
    onError: onConflict,
  });

  const renameBoard = useMutation({
    mutationFn: (title: string) => boardsApi.rename(boardId, title),
    onSuccess: (_, title) => update((board) => applyBoardEvent(board, { type: "board.renamed", title })),
    onError: onConflict,
  });

  return {
    moveCard,
    createCard,
    updateCard,
    deleteCard,
    createList,
    renameList,
    deleteList,
    renameBoard,
    notice,
    dismissNotice: () => setNotice(null),
  };
}
