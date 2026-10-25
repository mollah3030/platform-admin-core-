import { apiClient } from "@/lib/axios";
import type {
  Product,
  GetProductsParams,
  PaginatedProductsResponse,
} from "@/resources/interfaces/product.interface";

export const productsApi = {
  async getProducts(params?: GetProductsParams): Promise<PaginatedProductsResponse> {
    const response = await apiClient.get<PaginatedProductsResponse>("/admin/products", {
      params,
    });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/admin/products/${id}`);
    return response.data;
  },

  async approveProduct(id: string): Promise<Product> {
    const response = await apiClient.post<Product>(`/admin/products/${id}/approve`);
    return response.data;
  },

  async rejectProduct(id: string, reason: string): Promise<Product> {
    const response = await apiClient.post<Product>(`/admin/products/${id}/reject`, {
      reason,
    });
    return response.data;
  },


  async publishProduct(id: string): Promise<Product> {
    const response = await apiClient.post<Product>(`/admin/products/${id}/publish`);
    return response.data;
  },
};
