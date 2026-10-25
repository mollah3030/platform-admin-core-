import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { ordersApi } from "@/resources/apis/orders.api";
import type { GetOrdersParams } from "@/resources/interfaces/order.interface";

export function useOrders(params?: GetOrdersParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.getOrders(params),
    staleTime: 30_000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
