import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchRoleByIdAction } from "@/resources/actions/roles.actions";
import type { Role } from "@/resources/interfaces";

export function useRole(id: string, enabled = true) {
  return useQuery<Role>({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => fetchRoleByIdAction(id),
    enabled: Boolean(id) && enabled,
  });
}
