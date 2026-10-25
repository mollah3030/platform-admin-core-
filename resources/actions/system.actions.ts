import { systemApi } from "@/resources/apis/system.api";
import type { DatabaseStatusResponse } from "@/resources/interfaces";

export async function fetchDatabaseStatusAction(): Promise<DatabaseStatusResponse> {
  return systemApi.getDatabaseStatus();
}
