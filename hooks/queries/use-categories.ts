import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/resources/apis/categories.api";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  CategoryStatus,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/resources/interfaces/category.interface";
import { toast } from "sonner";

export function useCategories(status?: CategoryStatus) {
  return useQuery({
    queryKey: queryKeys.categories.list(status),
    queryFn: () => categoriesApi.getCategories(status),
    staleTime: 60 * 1000,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: () => categoriesApi.getCategoryTree(),
    staleTime: 60 * 1000,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoriesApi.getCategoryById(id),
    enabled: !!id,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesApi.createCategory(dto),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" created successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create category.";
      toast.error(Array.isArray(msg) ? msg.join(" · ") : msg);
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
      categoriesApi.updateCategory(id, dto),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update category.";
      toast.error(Array.isArray(msg) ? msg.join(" · ") : msg);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to delete category.";
      toast.error(Array.isArray(msg) ? msg.join(" · ") : msg);
    },
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
