"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { RolesListView } from "@/components/admin/roles/roles-list-view";

export default function RolesPage() {
  return (
    <AdminLayout requiredPermission="roles.read">
      <RolesListView />
    </AdminLayout>
  );
}
