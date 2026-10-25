import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchUserByIdAction } from "@/resources/actions/users.actions";
import type { User } from "@/resources/interfaces";

export function useUser(id: string, enabled = true) {
  return useQuery<User>({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => fetchUserByIdAction(id),
    enabled: Boolean(id) && enabled,
  });
}
