"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { AdminDashboardView } from "@/components/admin/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboardView />
    </AdminLayout>
  );
}
