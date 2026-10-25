import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchDatabaseStatusAction } from "@/resources/actions/system.actions";
import type { DatabaseStatusResponse } from "@/resources/interfaces";

export function useDatabaseStatus() {
  return useQuery<DatabaseStatusResponse>({
    queryKey: queryKeys.system.databaseStatus(),
    queryFn: () => fetchDatabaseStatusAction(),
    refetchInterval: 1000 * 30, // Poll health every 30s
  });
}
