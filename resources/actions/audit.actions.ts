import { auditApi } from "@/resources/apis/audit.api";
import type {
  AuditLog,
  PaginatedAuditLogsResponse,
  AuditLogQueryParams,
} from "@/resources/interfaces";

export async function fetchAuditLogsAction(
  params?: AuditLogQueryParams,
): Promise<PaginatedAuditLogsResponse> {
  return auditApi.getAuditLogs(params);
}

export async function fetchAuditLogByIdAction(id: string): Promise<AuditLog> {
  return auditApi.getAuditLogById(id);
}
