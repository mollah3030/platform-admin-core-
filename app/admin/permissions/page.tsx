"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { PermissionsListView } from "@/components/admin/permissions/permissions-list-view";

export default function PermissionsPage() {
  return (
    <AdminLayout requiredPermission="permissions.read">
      <PermissionsListView />
    </AdminLayout>
  );
}
