import { apiClient } from "@/lib/axios";
import type {
  PlatformRevenueSummary,
  PaginatedPayoutsResponse,
  PayoutQueryParams,
} from "@/resources/interfaces/payout.interface";

export const payoutsApi = {
  async getRevenueSummary(): Promise<PlatformRevenueSummary> {
    const response = await apiClient.get<PlatformRevenueSummary>("/admin/payouts/revenue");
    return response.data;
  },

  async getPayouts(params?: PayoutQueryParams): Promise<PaginatedPayoutsResponse> {
    const response = await apiClient.get<PaginatedPayoutsResponse>("/admin/payouts", {
      params,
    });
    return response.data;
  },

  async triggerClearance(): Promise<{ clearedCount: number; totalAmountCleared: number; message: string }> {
    const response = await apiClient.post("/admin/payouts/process-clearance");
    return response.data;
  },

  async triggerPayoutCycle(): Promise<{ clearedTransactions: number; payoutsCount: number; totalDisbursed: number }> {
    const response = await apiClient.post("/admin/payouts/process");
    return response.data;
  },
};
