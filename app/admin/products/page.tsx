"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { ProductsListView } from "@/components/admin/products/products-list-view";

export default function ProductsPage() {
  return (
    <AdminLayout>
      <ProductsListView />
    </AdminLayout>
  );
}
