"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { PayoutsView } from "@/components/admin/payouts/payouts-view";

export default function PayoutsPage() {
  return (
    <AdminLayout>
      <PayoutsView />
    </AdminLayout>
  );
}
