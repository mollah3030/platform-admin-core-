"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { UsersListView } from "@/components/admin/users/users-list-view";

export default function UsersPage() {
  return (
    <AdminLayout requiredPermission="users.read">
      <UsersListView />
    </AdminLayout>
  );
}
