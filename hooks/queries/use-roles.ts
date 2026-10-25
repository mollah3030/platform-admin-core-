import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchRolesAction } from "@/resources/actions/roles.actions";
import type { Role } from "@/resources/interfaces";

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: queryKeys.roles.lists(),
    queryFn: () => fetchRolesAction(),
  });
}
