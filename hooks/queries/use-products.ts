import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { productsApi } from "@/resources/apis/products.api";
import type { GetProductsParams } from "@/resources/interfaces/product.interface";

export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.getProducts(params),
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
