import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().max(254).transform((v) => v.toLowerCase()),
  name: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const roleSchema = z.enum(["OWNER", "EDITOR", "VIEWER"]);
export type BoardRole = z.infer<typeof roleSchema>;

export const createBoardSchema = z.object({ title: z.string().trim().min(1).max(100) });
export const renameSchema = z.object({ title: z.string().trim().min(1).max(200) });

export const inviteMemberSchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const createListSchema = z.object({ title: z.string().trim().min(1).max(100) });

export const createCardSchema = z.object({ title: z.string().trim().min(1).max(200) });

export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    version: z.number().int().positive(),
  })
  .refine((v) => v.title !== undefined || v.description !== undefined, "Nothing to update");

/** Clients send neighbours, not positions: the server computes the key, so it stays the source of truth. */
export const moveCardSchema = z.object({
  toListId: z.string().min(1),
  afterCardId: z.string().min(1).nullable(),
  beforeCardId: z.string().min(1).nullable(),
  version: z.number().int().positive(),
});
export type MoveCardInput = z.infer<typeof moveCardSchema>;

export const moveListSchema = z.object({
  afterListId: z.string().min(1).nullable(),
  beforeListId: z.string().min(1).nullable(),
});
