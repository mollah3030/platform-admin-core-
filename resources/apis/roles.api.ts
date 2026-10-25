import { apiClient } from "@/lib/axios";
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRolePermissionRequest,
} from "@/resources/interfaces";

export const rolesApi = {
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>("/admin/roles");
    return response.data;
  },

  async getRoleById(id: string): Promise<Role> {
    const response = await apiClient.get<Role>(`/admin/roles/${id}`);
    return response.data;
  },

  async createRole(payload: CreateRoleRequest): Promise<Role> {
    const response = await apiClient.post<Role>("/admin/roles", payload);
    return response.data;
  },

  async updateRole(id: string, payload: UpdateRoleRequest): Promise<Role> {
    const response = await apiClient.patch<Role>(`/admin/roles/${id}`, payload);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/admin/roles/${id}`);
  },

  async assignPermission(
    roleId: string,
    payload: AssignRolePermissionRequest,
  ): Promise<{ id: string; roleId: string; permissionId: string; assignedAt: string }> {
    const response = await apiClient.post(
      `/admin/roles/${roleId}/permissions`,
      payload,
    );
    return response.data;
  },

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await apiClient.delete(`/admin/roles/${roleId}/permissions/${permissionId}`);
  },
};
