import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { payoutsApi } from "@/resources/apis/payouts.api";
import type {
  PayoutQueryParams,
  PlatformRevenueSummary,
  PaginatedPayoutsResponse,
} from "@/resources/interfaces/payout.interface";

export function usePlatformRevenue() {
  return useQuery<PlatformRevenueSummary>({
    queryKey: queryKeys.payouts.revenue(),
    queryFn: () => payoutsApi.getRevenueSummary(),
    staleTime: 30_000,
  });
}

export function usePayouts(params?: PayoutQueryParams) {
  return useQuery<PaginatedPayoutsResponse>({
    queryKey: queryKeys.payouts.list(params),
    queryFn: () => payoutsApi.getPayouts(params),
    staleTime: 30_000,
  });
}
