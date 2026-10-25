import type { UserRole } from "./role.interface";

export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  userRoles?: UserRole[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UserQueryParams extends PaginationParams {
  search?: string;
  status?: UserStatus;
}

export type PaginatedUsersResponse = PaginatedResponse<User>;


export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface AssignUserRoleRequest {
  roleId: string;
}
