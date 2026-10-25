import type { User } from "./user.interface";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "USER_ROLE_ASSIGNED"
  | "USER_ROLE_REMOVED"
  | "ROLE_CREATED"
  | "ROLE_UPDATED"
  | "ROLE_DELETED"
  | "ROLE_PERMISSION_ASSIGNED"
  | "ROLE_PERMISSION_REMOVED"
  | "PERMISSION_CREATED"
  | "PERMISSION_UPDATED"
  | "PERMISSION_DELETED"
  | "STORE_APPLICATION_SUBMITTED"
  | "STORE_APPROVED"
  | "STORE_REJECTED"
  | "STORE_ACTIVATED"
  | "STORE_SUSPENDED"
  | "STORE_REACTIVATED"
  | "STORE_ADMIN_LOGIN"
  | "STORE_ADMIN_ADDED"
  | "STORE_ADMIN_REMOVED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  | "PRODUCT_ARCHIVED"
  | "PRODUCT_SUBMITTED"
  | "PRODUCT_APPROVED"
  | "PRODUCT_REJECTED"
  | "PRODUCT_PUBLISHED"
  | "INVENTORY_UPDATED"
  | "INVENTORY_ADJUSTED"
  | "CART_CREATED"
  | "CART_ITEM_ADDED"
  | "CART_CLEARED"
  | "ORDER_CREATED"
  | "ORDER_CANCELLED"
  | "ORDER_STATUS_CHANGED"
  | "STORE_ORDER_STATUS_CHANGED";

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: AuditAction;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor?: User | null;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  action?: AuditAction;
  resource?: string;
  actorUserId?: string;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
