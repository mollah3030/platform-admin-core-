"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { SettingsView } from "@/components/admin/settings/settings-view";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <SettingsView />
    </AdminLayout>
  );
}
