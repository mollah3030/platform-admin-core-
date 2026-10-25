import { apiClient } from "@/lib/axios";
import type { DatabaseStatusResponse } from "@/resources/interfaces";

export const systemApi = {
  async getDatabaseStatus(): Promise<DatabaseStatusResponse> {
    const response = await apiClient.get<DatabaseStatusResponse>("/database/status");
    return response.data;
  },
};
