import { apiClient } from "@/lib/axios";
import type {
  Category,
  CategoryStatus,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/resources/interfaces/category.interface";

export const categoriesApi = {
  // Public / Admin list of categories
  getCategories: async (status?: CategoryStatus): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/categories", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  // Hierarchical category tree
  getCategoryTree: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/categories/tree");
    return response.data;
  },

  // Single category details
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  // Platform Admin: Create category
  createCategory: async (dto: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<Category>("/categories", dto);
    return response.data;
  },

  // Platform Admin: Update category
  updateCategory: async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, dto);
    return response.data;
  },

  // Platform Admin: Delete category
  deleteCategory: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
