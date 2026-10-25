import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name cannot exceed 100 characters"),
  description: z
    .string()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),
});

export type CreateRoleSchemaType = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z
    .string()
    .max(100, "Role name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateRoleSchemaType = z.infer<typeof updateRoleSchema>;
