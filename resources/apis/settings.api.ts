import { apiClient } from "@/lib/axios";
import type {
  PlatformSettingsSummary,
  UpdatePlatformFeeDto,
  UpdateHoldDaysDto,
  UpdateMinimumPayoutDto,
} from "@/resources/interfaces/settings.interface";

export const settingsApi = {
  async getSettingsSummary(): Promise<PlatformSettingsSummary> {
    const response = await apiClient.get<PlatformSettingsSummary>("/admin/settings/summary");
    return response.data;
  },

  async updateFeePercent(dto: UpdatePlatformFeeDto): Promise<any> {
    const response = await apiClient.patch("/admin/settings/fee-percent", dto);
    return response.data;
  },

  async updateHoldDays(dto: UpdateHoldDaysDto): Promise<any> {
    const response = await apiClient.patch("/admin/settings/hold-days", dto);
    return response.data;
  },

  async updateMinimumPayout(dto: UpdateMinimumPayoutDto): Promise<any> {
    const response = await apiClient.patch("/admin/settings/minimum-payout", dto);
    return response.data;
  },
};
