import type { ActivityDto, CardDto, ListDto } from '@board/shared';

export function toCardDto(card: {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: string;
  version: number;
  updatedAt: Date;
}): CardDto {
  return {
    id: card.id,
    listId: card.listId,
    title: card.title,
    description: card.description,
    position: card.position,
    version: card.version,
    updatedAt: card.updatedAt.toISOString(),
  };
}

export function toListDto(list: { id: string; title: string; position: string }): ListDto {
  return { id: list.id, title: list.title, position: list.position };
}

export function toActivityDto(activity: {
  id: string;
  summary: string;
  createdAt: Date;
  actor: { id: string; email: string; name: string };
}): ActivityDto {
  return {
    id: activity.id,
    summary: activity.summary,
    createdAt: activity.createdAt.toISOString(),
    actor: { id: activity.actor.id, email: activity.actor.email, name: activity.actor.name },
  };
}
