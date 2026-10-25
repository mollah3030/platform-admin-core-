"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { StoresListView } from "@/components/admin/stores/stores-list-view";

export default function StoresPage() {
  return (
    <AdminLayout>
      <StoresListView />
    </AdminLayout>
  );
}
