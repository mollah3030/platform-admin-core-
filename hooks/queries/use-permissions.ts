import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchPermissionsAction } from "@/resources/actions/permissions.actions";
import type { Permission } from "@/resources/interfaces";

export function usePermissions() {
  return useQuery<Permission[]>({
    queryKey: queryKeys.permissions.lists(),
    queryFn: () => fetchPermissionsAction(),
  });
}
