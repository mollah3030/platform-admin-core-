"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { AuditLogsView } from "@/components/admin/audit-logs/audit-logs-view";

export default function AuditLogsPage() {
  return (
    <AdminLayout requiredPermission="audit.read">
      <AuditLogsView />
    </AdminLayout>
  );
}
