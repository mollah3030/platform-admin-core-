import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchAuditLogByIdAction } from "@/resources/actions/audit.actions";
import type { AuditLog } from "@/resources/interfaces";

export function useAuditLog(id: string, enabled = true) {
  return useQuery<AuditLog>({
    queryKey: queryKeys.auditLogs.detail(id),
    queryFn: () => fetchAuditLogByIdAction(id),
    enabled: Boolean(id) && enabled,
  });
}
