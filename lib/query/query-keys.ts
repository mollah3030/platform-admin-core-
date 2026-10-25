import type { UserQueryParams, AuditLogQueryParams } from "@/resources/interfaces";

export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: UserQueryParams) =>
      [...queryKeys.users.lists(), params ?? {}] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Roles
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },

  // Permissions
  permissions: {
    all: ["permissions"] as const,
    lists: () => [...queryKeys.permissions.all, "list"] as const,
    details: () => [...queryKeys.permissions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.permissions.details(), id] as const,
  },

  // Audit Logs
  auditLogs: {
    all: ["auditLogs"] as const,
    lists: () => [...queryKeys.auditLogs.all, "list"] as const,
    list: (params?: AuditLogQueryParams) =>
      [...queryKeys.auditLogs.lists(), params ?? {}] as const,
    details: () => [...queryKeys.auditLogs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.auditLogs.details(), id] as const,
  },

  // Stores
  stores: {
    all: ["stores"] as const,
    lists: () => [...queryKeys.stores.all, "list"] as const,
    list: (params?: any) => [...queryKeys.stores.lists(), params ?? {}] as const,
    details: () => [...queryKeys.stores.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.stores.details(), id] as const,
  },

  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params?: any) => [...queryKeys.products.lists(), params ?? {}] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (params?: any) => [...queryKeys.orders.lists(), params ?? {}] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Categories
  categories: {
    all: ["categories"] as const,
    tree: () => [...queryKeys.categories.all, "tree"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (status?: string) =>
      [...queryKeys.categories.lists(), { status }] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  // Platform Settings
  settings: {
    all: ["settings"] as const,
    summary: () => [...queryKeys.settings.all, "summary"] as const,
  },

  // Payouts & Settlement
  payouts: {
    all: ["payouts"] as const,
    revenue: () => [...queryKeys.payouts.all, "revenue"] as const,
    lists: () => [...queryKeys.payouts.all, "list"] as const,
    list: (params?: any) => [...queryKeys.payouts.lists(), params ?? {}] as const,
  },

  // Invoices
  invoices: {
    all: ["invoices"] as const,
    lists: () => [...queryKeys.invoices.all, "list"] as const,
    list: (params?: any) => [...queryKeys.invoices.lists(), params ?? {}] as const,
    details: () => [...queryKeys.invoices.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
  },

  // System
  system: {
    all: ["system"] as const,
    databaseStatus: () => [...queryKeys.system.all, "databaseStatus"] as const,
  },
};
