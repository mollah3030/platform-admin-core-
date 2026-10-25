import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { getMeAction } from "@/resources/actions/auth.actions";
import { authStorage } from "@/lib/auth/auth-storage";
import type { JwtPayload } from "@/resources/interfaces";

export function useAuthMe(enabled = true) {
  return useQuery<JwtPayload>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => getMeAction(),
    enabled: authStorage.isAuthenticated() && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
