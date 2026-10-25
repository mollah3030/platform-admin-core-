import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { storesApi } from "@/resources/apis/stores.api";
import type { GetStoresParams } from "@/resources/interfaces/store.interface";

export function useStores(params?: GetStoresParams) {
  return useQuery({
    queryKey: queryKeys.stores.list(params),
    queryFn: () => storesApi.getStores(params),
    staleTime: 30_000,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: queryKeys.stores.detail(id),
    queryFn: () => storesApi.getStoreById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
