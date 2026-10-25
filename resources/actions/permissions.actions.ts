import { permissionsApi } from "@/resources/apis/permissions.api";
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/resources/interfaces";

export async function fetchPermissionsAction(): Promise<Permission[]> {
  return permissionsApi.getPermissions();
}

export async function fetchPermissionByIdAction(id: string): Promise<Permission> {
  return permissionsApi.getPermissionById(id);
}

export async function createPermissionAction(
  payload: CreatePermissionRequest,
): Promise<Permission> {
  return permissionsApi.createPermission(payload);
}

export async function updatePermissionAction(
  id: string,
  payload: UpdatePermissionRequest,
): Promise<Permission> {
  return permissionsApi.updatePermission(id, payload);
}

export async function deletePermissionAction(id: string): Promise<void> {
  return permissionsApi.deletePermission(id);
}
