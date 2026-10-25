import { apiClient } from "@/lib/axios";
import type {
  AuditLog,
  PaginatedAuditLogsResponse,
  AuditLogQueryParams,
} from "@/resources/interfaces";

export const auditApi = {
  async getAuditLogs(
    params?: AuditLogQueryParams,
  ): Promise<PaginatedAuditLogsResponse> {
    const response = await apiClient.get<PaginatedAuditLogsResponse>(
      "/admin/audit-logs",
      { params },
    );
    return response.data;
  },

  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await apiClient.get<AuditLog>(`/admin/audit-logs/${id}`);
    return response.data;
  },
};
