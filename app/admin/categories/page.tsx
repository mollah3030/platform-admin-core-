"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { CategoriesView } from "@/components/admin/categories/categories-view";

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <CategoriesView />
    </AdminLayout>
  );
}
