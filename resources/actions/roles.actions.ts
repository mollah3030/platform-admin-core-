import { rolesApi } from "@/resources/apis/roles.api";
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRolePermissionRequest,
} from "@/resources/interfaces";

export async function fetchRolesAction(): Promise<Role[]> {
  return rolesApi.getRoles();
}

export async function fetchRoleByIdAction(id: string): Promise<Role> {
  return rolesApi.getRoleById(id);
}

export async function createRoleAction(payload: CreateRoleRequest): Promise<Role> {
  return rolesApi.createRole(payload);
}

export async function updateRoleAction(
  id: string,
  payload: UpdateRoleRequest,
): Promise<Role> {
  return rolesApi.updateRole(id, payload);
}

export async function deleteRoleAction(id: string): Promise<void> {
  return rolesApi.deleteRole(id);
}

export async function assignRolePermissionAction(
  roleId: string,
  payload: AssignRolePermissionRequest,
): Promise<{ id: string; roleId: string; permissionId: string; assignedAt: string }> {
  return rolesApi.assignPermission(roleId, payload);
}

export async function removeRolePermissionAction(
  roleId: string,
  permissionId: string,
): Promise<void> {
  return rolesApi.removePermission(roleId, permissionId);
}
