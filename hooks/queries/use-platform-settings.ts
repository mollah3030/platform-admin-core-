import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { settingsApi } from "@/resources/apis/settings.api";
import type { PlatformSettingsSummary } from "@/resources/interfaces/settings.interface";

export function usePlatformSettings() {
  return useQuery<PlatformSettingsSummary>({
    queryKey: queryKeys.settings.summary(),
    queryFn: () => settingsApi.getSettingsSummary(),
    staleTime: 60_000,
  });
}
