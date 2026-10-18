import type { ActivityDto, BoardDto, BoardSummaryDto, CardDto, ListDto, MemberDto, MoveCardInput } from "@board/shared";
import { api } from "@/lib/api-client";

export const boardsApi = {
  list: () => api<BoardSummaryDto[]>("/boards"),
  create: (title: string) => api<BoardSummaryDto>("/boards", { method: "POST", body: { title } }),
  get: (boardId: string) => api<BoardDto>(`/boards/${boardId}`),
  rename: (boardId: string, title: string) => api<void>(`/boards/${boardId}`, { method: "PATCH", body: { title } }),
  remove: (boardId: string) => api<void>(`/boards/${boardId}`, { method: "DELETE" }),
  invite: (boardId: string, email: string, role: "EDITOR" | "VIEWER") =>
    api<MemberDto>(`/boards/${boardId}/members`, { method: "POST", body: { email, role } }),
  activity: (boardId: string) => api<ActivityDto[]>(`/boards/${boardId}/activity`),
  createList: (boardId: string, title: string) => api<ListDto>(`/boards/${boardId}/lists`, { method: "POST", body: { title } }),
  renameList: (listId: string, title: string) => api<ListDto>(`/lists/${listId}`, { method: "PATCH", body: { title } }),
  deleteList: (listId: string) => api<void>(`/lists/${listId}`, { method: "DELETE" }),
  createCard: (listId: string, title: string) => api<CardDto>(`/lists/${listId}/cards`, { method: "POST", body: { title } }),
  updateCard: (cardId: string, patch: { title?: string; description?: string; version: number }) =>
    api<CardDto>(`/cards/${cardId}`, { method: "PATCH", body: patch }),
  moveCard: (cardId: string, input: MoveCardInput) => api<CardDto>(`/cards/${cardId}/move`, { method: "POST", body: input }),
  deleteCard: (cardId: string) => api<void>(`/cards/${cardId}`, { method: "DELETE" }),
};

export const boardKeys = {
  all: ["boards"] as const,
  detail: (boardId: string) => ["boards", boardId] as const,
  activity: (boardId: string) => ["boards", boardId, "activity"] as const,
};
