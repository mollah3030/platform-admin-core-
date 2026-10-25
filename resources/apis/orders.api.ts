import { apiClient } from "@/lib/axios";
import type {
  Order,
  GetOrdersParams,
  PaginatedOrdersResponse,
} from "@/resources/interfaces/order.interface";

export const ordersApi = {
  async getOrders(params?: GetOrdersParams): Promise<PaginatedOrdersResponse> {
    const response = await apiClient.get<PaginatedOrdersResponse>("/admin/orders", {
      params,
    });
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/admin/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${id}/status`, {
      status,
    });
    return response.data;
  },
};
