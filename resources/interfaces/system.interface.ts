export interface DatabaseStatusResponse {
  status: "connected" | "disconnected" | "error";
  databaseConnected: boolean;
  databaseName?: string;
  user?: string;
  serverTime?: string;
  postgresVersion?: string;
  message?: string;
}

export interface SystemOverviewStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalAuditEvents: number;
}
