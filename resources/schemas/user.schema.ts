import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z
    .string()
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;

export const assignRoleSchema = z.object({
  roleId: z.string().uuid("Please select a valid role"),
});

export type AssignRoleSchemaType = z.infer<typeof assignRoleSchema>;
