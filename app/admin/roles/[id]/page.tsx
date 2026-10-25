"use client";

import { use } from "react";
import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { RoleDetailsView } from "@/components/admin/roles/role-details-view";

export default function RolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <AdminLayout requiredPermission="roles.read">
      <RoleDetailsView id={resolvedParams.id} />
    </AdminLayout>
  );
}
