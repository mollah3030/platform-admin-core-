import type { Permission } from "./permission.interface";
import type { User } from "./user.interface";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rolePermissions?: RolePermission[];
  userRoles?: UserRole[];
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  role?: Role;
  user?: User;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  assignedAt: string;
  permission?: Permission;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignRolePermissionRequest {
  permissionId: string;
}
