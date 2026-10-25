import { apiClient } from "@/lib/axios";
import type {
  User,
  PaginatedUsersResponse,
  UserQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  AssignUserRoleRequest,
  MessageResponse,
} from "@/resources/interfaces";

export const usersApi = {
  async getUsers(params?: UserQueryParams): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<PaginatedUsersResponse>("/admin/users", {
      params,
    });
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  async createUser(payload: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>("/admin/users", payload);
    return response.data;
  },

  async updateUser(id: string, payload: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${id}`, payload);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async activateUser(id: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/admin/users/${id}/activate`,
    );
    return response.data;
  },

  async deactivateUser(id: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/admin/users/${id}/deactivate`,
    );
    return response.data;
  },

  async assignRole(
    userId: string,
    payload: AssignUserRoleRequest,
  ): Promise<{ id: string; userId: string; roleId: string; assignedAt: string }> {
    const response = await apiClient.post(
      `/admin/users/${userId}/roles`,
      payload,
    );
    return response.data;
  },

  async removeRole(userId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}/roles/${roleId}`);
  },
};
