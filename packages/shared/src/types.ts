import type { BoardRole } from "./schemas.js";

export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export interface CardDto {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: string;
  version: number;
  updatedAt: string;
}

export interface ListDto {
  id: string;
  title: string;
  position: string;
}

export interface MemberDto {
  user: UserDto;
  role: BoardRole;
}

export interface BoardSummaryDto {
  id: string;
  title: string;
  role: BoardRole;
  updatedAt: string;
}

export interface BoardDto {
  id: string;
  title: string;
  role: BoardRole;
  members: MemberDto[];
  lists: ListDto[];
  cards: CardDto[];
}

export interface ActivityDto {
  id: string;
  summary: string;
  actor: UserDto;
  createdAt: string;
}
