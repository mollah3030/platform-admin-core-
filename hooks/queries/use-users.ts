import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchUsersAction } from "@/resources/actions/users.actions";
import type { UserQueryParams, PaginatedUsersResponse } from "@/resources/interfaces";

export function useUsers(params?: UserQueryParams) {
  return useQuery<PaginatedUsersResponse>({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsersAction(params),
  });
}
