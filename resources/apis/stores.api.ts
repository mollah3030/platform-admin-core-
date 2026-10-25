import { apiClient } from "@/lib/axios";
import type {
  Store,
  StoreStatus,
  GetStoresParams,
  PaginatedStoresResponse,
  UpdateStorePayload,
  UpdateStoreStatusPayload,
} from "@/resources/interfaces/store.interface";

export const storesApi = {
  async getStores(params?: GetStoresParams): Promise<PaginatedStoresResponse> {
    const response = await apiClient.get<PaginatedStoresResponse>("/admin/stores", {
      params,
    });
    return response.data;
  },

  async getStoreById(id: string): Promise<Store> {
    const response = await apiClient.get<Store>(`/admin/stores/${id}`);
    return response.data;
  },

  async updateStore(id: string, payload: UpdateStorePayload): Promise<Store> {
    const response = await apiClient.patch<Store>(`/admin/stores/${id}`, payload);
    return response.data;
  },

  async updateStoreStatus(id: string, status: StoreStatus, reason?: string): Promise<Store> {
    const response = await apiClient.patch<Store>(`/admin/stores/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  async approveStore(id: string): Promise<Store> {
    const response = await apiClient.post<Store>(`/admin/stores/${id}/approve`);
    return response.data;
  },

  async rejectStore(id: string, reason: string): Promise<Store> {
    const response = await apiClient.post<Store>(`/admin/stores/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  async activateStore(id: string): Promise<Store> {
    const response = await apiClient.post<Store>(`/admin/stores/${id}/activate`);
    return response.data;
  },

  async suspendStore(id: string, reason: string): Promise<Store> {
    const response = await apiClient.post<Store>(`/admin/stores/${id}/suspend`, {
      reason,
    });
    return response.data;
  },

  async addStoreAdmin(id: string, userId: string): Promise<any> {
    const response = await apiClient.post(`/admin/stores/${id}/admins`, {
      userId,
    });
    return response.data;
  },

  async removeStoreAdmin(id: string, adminId: string): Promise<any> {
    const response = await apiClient.delete(`/admin/stores/${id}/admins/${adminId}`);
    return response.data;
  },
};


