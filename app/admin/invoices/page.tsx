"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { InvoicesView } from "@/components/admin/invoices/invoices-view";

export default function InvoicesPage() {
  return (
    <AdminLayout>
      <InvoicesView />
    </AdminLayout>
  );
}
