"use client";

import { use } from "react";
import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { StoreDetailsView } from "@/components/admin/stores/store-details-view";

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <AdminLayout>
      <StoreDetailsView id={resolvedParams.id} />
    </AdminLayout>
  );
}
