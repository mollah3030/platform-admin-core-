"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ProtectedRoute } from "@/components/shared/protected-route";

export function AdminLayout({
  children,
  requiredPermission,
}: {
  children: React.ReactNode;
  requiredPermission?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-[#0B0B0E] text-[#F4F4F6]">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex flex-1 flex-col min-w-0 w-full max-w-full overflow-x-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 2xl:p-10 w-full min-w-0">
            <div className="mx-auto w-full max-w-[1720px] min-w-0 space-y-6 sm:space-y-8">{children}</div>
          </main>
        </div>
      </div>

    </ProtectedRoute>
  );
}
