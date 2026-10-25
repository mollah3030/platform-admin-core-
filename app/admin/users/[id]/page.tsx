"use client";

import { use } from "react";
import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { UserDetailsView } from "@/components/admin/users/user-details-view";

export default function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <AdminLayout requiredPermission="users.read">
      <UserDetailsView id={resolvedParams.id} />
    </AdminLayout>
  );
}
