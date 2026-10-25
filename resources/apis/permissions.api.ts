import { apiClient } from "@/lib/axios";
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/resources/interfaces";

export const permissionsApi = {
  async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>("/admin/permissions");
    return response.data;
  },

  async getPermissionById(id: string): Promise<Permission> {
    const response = await apiClient.get<Permission>(`/admin/permissions/${id}`);
    return response.data;
  },

  async createPermission(payload: CreatePermissionRequest): Promise<Permission> {
    const response = await apiClient.post<Permission>("/admin/permissions", payload);
    return response.data;
  },

  async updatePermission(
    id: string,
    payload: UpdatePermissionRequest,
  ): Promise<Permission> {
    const response = await apiClient.patch<Permission>(
      `/admin/permissions/${id}`,
      payload,
    );
    return response.data;
  },

  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/admin/permissions/${id}`);
  },
};
