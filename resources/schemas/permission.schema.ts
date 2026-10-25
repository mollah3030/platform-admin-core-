import { z } from "zod";

export const createPermissionSchema = z.object({
  key: z
    .string()
    .min(1, "Permission key is required")
    .max(100, "Key cannot exceed 100 characters")
    .regex(
      /^[a-z_]+\.[a-z_]+$/,
      "Key must be formatted as resource.action (lowercase, underscores allowed)",
    ),
  resource: z
    .string()
    .min(1, "Resource name is required")
    .max(100, "Resource cannot exceed 100 characters")
    .toLowerCase(),
  action: z
    .string()
    .min(1, "Action name is required")
    .max(100, "Action cannot exceed 100 characters")
    .toLowerCase(),
  description: z
    .string()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),
});

export type CreatePermissionSchemaType = z.infer<typeof createPermissionSchema>;

export const updatePermissionSchema = z.object({
  description: z
    .string()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),
});

export type UpdatePermissionSchemaType = z.infer<typeof updatePermissionSchema>;
