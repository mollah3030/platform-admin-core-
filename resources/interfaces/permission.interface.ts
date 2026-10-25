export interface Permission {
  id: string;
  key: string;
  resource: string;
  action: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionRequest {
  key: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  description?: string;
}
