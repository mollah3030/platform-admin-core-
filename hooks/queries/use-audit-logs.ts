import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchAuditLogsAction } from "@/resources/actions/audit.actions";
import type { AuditLogQueryParams, PaginatedAuditLogsResponse } from "@/resources/interfaces";

export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery<PaginatedAuditLogsResponse>({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => fetchAuditLogsAction(params),
  });
}
