"use client";

import React from "react";
import NextLink from "next/link";
import {
  Store as StoreIcon,
  Package,
  Users,
  ShieldCheck,
  RotateCw,
  Database,
  ArrowUpRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/queries/use-users";
import { useRoles } from "@/hooks/queries/use-roles";
import { usePermissions } from "@/hooks/queries/use-permissions";
import { useAuditLogs } from "@/hooks/queries/use-audit-logs";
import { useStores } from "@/hooks/queries/use-stores";
import { useProducts } from "@/hooks/queries/use-products";
import { useDatabaseStatus } from "@/hooks/queries/use-database-status";
import { formatDate } from "@/lib/utils";
import type { Store, Product } from "@/resources/interfaces";

export function AdminDashboardView() {
  // Real TanStack Queries connected to live NestJS backend endpoints
  const {
    data: storesData,
    isLoading: storesLoading,
    refetch: refetchStores,
  } = useStores({ page: 1, limit: 10 });

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts({ page: 1, limit: 10 });

  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useUsers({ page: 1, limit: 100 });

  const {
    data: rolesData = [],
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useRoles();

  const {
    data: permissionsData = [],
    isLoading: permissionsLoading,
    refetch: refetchPerms,
  } = usePermissions();

  const {
    data: auditData,
    isLoading: auditLoading,
    refetch: refetchAudit,
  } = useAuditLogs({ page: 1, limit: 8 });

  const {
    data: dbStatus,
    isLoading: dbLoading,
    refetch: refetchDb,
  } = useDatabaseStatus();

  const handleRefreshAll = () => {
    refetchStores();
    refetchProducts();
    refetchUsers();
    refetchRoles();
    refetchPerms();
    refetchAudit();
    refetchDb();
  };

  // Real backend calculations
  const totalStores = storesData?.total ?? 0;
  const activeStores =
    storesData?.data?.filter((s: Store) => s.status === "ACTIVE").length ?? 0;
  const pendingStores =
    storesData?.data?.filter((s: Store) => s.status === "PENDING").length ?? 0;

  const totalProducts = productsData?.total ?? 0;
  const draftProducts =
    productsData?.data?.filter((p: Product) => p.status === "DRAFT").length ?? 0;
  const publishedProducts =
    productsData?.data?.filter((p: Product) => p.status === "PUBLISHED").length ?? 0;
  const pendingApprovalProducts =
    productsData?.data?.filter((p: Product) => p.status === "PENDING_APPROVAL").length ?? 0;

  const totalUsers = usersData?.total ?? 0;
  const activeUsers =
    usersData?.data?.filter((u) => u.status === "active").length ?? 0;

  const totalRoles = rolesData.length;
  const totalPermissions = permissionsData.length;
  const recentAudit = auditData?.data ?? [];
  const stores: Store[] = storesData?.data ?? [];
  const products: Product[] = productsData?.data ?? [];


  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Platform Admin Header */}
      {/* Platform Admin Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Platform Admin Dashboard
            </h1>
            <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[10px] font-semibold tracking-wide">
              Platform Core
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Multi-Tenant SaaS Marketplace Overview · Stores, Catalog Moderation, Staff &amp; Database Health
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Live DB indicator */}
          {dbStatus && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14141A] border border-[#22222C] text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#A2A3B0] font-mono text-[11px]">
                {dbStatus.databaseName} ({dbStatus.postgresVersion?.split(" ")[1] || "18.4"})
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="h-9 rounded-xl bg-[#14141A] border-[#22222C] text-[#8E8F99] hover:text-white hover:bg-white/[0.05] gap-1.5 text-xs font-medium"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Stat Cards - 100% Real Backend Data */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Stores & Tenants */}
        <NextLink
          href="/admin/stores"
          className="group rounded-2xl bg-[#121217] border border-[#1E1E26] hover:border-emerald-500/30 p-5 flex flex-col justify-between transition-all hover:bg-[#15151C] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              STORES / TENANTS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <StoreIcon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {storesLoading ? (
              <Skeleton className="h-8 w-20 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono">
                {totalStores}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-[#6F707E]">
                {activeStores} active · {pendingStores} pending
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                <span>Directory</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </NextLink>

        {/* Card 2: Catalog Products */}
        <NextLink
          href="/admin/products"
          className="group rounded-2xl bg-[#121217] border border-[#1E1E26] hover:border-blue-500/30 p-5 flex flex-col justify-between transition-all hover:bg-[#15151C] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              CATALOG PRODUCTS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Package className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {productsLoading ? (
              <Skeleton className="h-8 w-20 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono">
                {totalProducts}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-[#6F707E]">
                {draftProducts} draft · {publishedProducts} published
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                <span>Moderation</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </NextLink>

        {/* Card 3: Platform Users */}
        <NextLink
          href="/admin/users"
          className="group rounded-2xl bg-[#121217] border border-[#1E1E26] hover:border-purple-500/30 p-5 flex flex-col justify-between transition-all hover:bg-[#15151C] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              PLATFORM USERS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {usersLoading ? (
              <Skeleton className="h-8 w-20 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono">
                {totalUsers}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-[#6F707E]">
                {activeUsers} active accounts
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-purple-400 group-hover:translate-x-0.5 transition-transform">
                <span>Accounts</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </NextLink>

        {/* Card 4: Access Roles & Permissions */}
        <NextLink
          href="/admin/roles"
          className="group rounded-2xl bg-[#121217] border border-[#1E1E26] hover:border-amber-500/30 p-5 flex flex-col justify-between transition-all hover:bg-[#15151C] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              RBAC SECURITY
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {rolesLoading || permissionsLoading ? (
              <Skeleton className="h-8 w-20 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono">
                {totalRoles}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-[#6F707E]">
                {totalPermissions} active system permissions
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                <span>Clearance</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </NextLink>
      </div>

      {/* Middle Section: Real Stores Overview + Real Audit Trail */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12 w-full min-w-0">
        {/* Left Column: Stores & Catalog Status (7 cols) */}
        <div className="xl:col-span-7 space-y-6 min-w-0">
          {/* Marketplace Stores Widget */}
          <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 sm:p-6 space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Registered Stores &amp; Tenants</h2>
                <p className="text-xs text-[#6F707E]">
                  Multi-tenant vendor stores operating on the platform
                </p>
              </div>
              <Badge variant="outline" className="bg-[#16161D] border-[#22222C] text-xs text-[#8E8F99]">
                {totalStores} Total
              </Badge>
            </div>

            {storesLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-[#181820] rounded-xl" />
                ))}
              </div>
            ) : stores.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F707E]">
                No stores registered yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map((s) => (
                  <NextLink
                    key={s.id}
                    href={`/admin/stores/${s.id}`}
                    className="group block p-4 rounded-xl bg-[#16161D] border border-[#20202A] hover:border-rose-500/30 hover:bg-[#1A1A24] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors">
                            {s.name}
                          </span>
                          <Badge
                            variant={s.status === "ACTIVE" ? "success" : "secondary"}
                            className="text-[10px]"
                          >
                            {s.status}
                          </Badge>
                          <span className="text-[11px] text-[#6F707E] font-mono">
                            ID: {s.businessId}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8F99] truncate">
                          {s.legalBusinessName} · {s.address || "No address provided"}
                        </p>
                        <p className="text-[11px] text-[#6F707E]">
                          Contact: {s.contactName || "N/A"} · Currency: {s.currency} · Timezone: {s.timezone}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                        <span className="text-[10px] text-[#6E6F7C]">
                          Registered {formatDate(s.createdAt)}
                        </span>
                        <span className="text-xs font-medium text-rose-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          View Store Details
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </NextLink>
                ))}
              </div>
            )}
          </div>

          {/* Products Moderation Preview */}
          <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 sm:p-6 space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Marketplace Catalog Products</h2>
                <p className="text-xs text-[#6F707E]">
                  Products submitted by tenant vendors across the platform
                </p>
              </div>
              <Badge variant="outline" className="bg-[#16161D] border-[#22222C] text-xs text-[#8E8F99]">
                {totalProducts} Products
              </Badge>
            </div>

            {productsLoading ? (
              <Skeleton className="h-16 w-full bg-[#181820] rounded-xl" />
            ) : products.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F707E]">
                No products uploaded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-[#16161D] border border-[#20202A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {p.name}
                        </span>
                        <Badge
                          variant={
                            p.status === "PUBLISHED"
                              ? "success"
                              : p.status === "DRAFT"
                              ? "secondary"
                              : "default"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                        <span className="text-xs text-rose-400 font-mono font-semibold">
                          ${p.price}
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8F99] truncate">
                        Store: {p.store?.name || "Marketplace"} · SKU: {p.sku}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-[#6E6F7C] block">
                        VAT {p.vatRate}% ({p.vatCode || "Standard"})
                      </span>
                      <span className="text-[11px] text-[#A2A3B0]">
                        {p.variants?.length || 0} variant(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Audit Operations + System Health (5 cols) */}
        <div className="xl:col-span-5 space-y-6 min-w-0">
          {/* Real Audit Logs Activity Feed */}
          <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 sm:p-6 space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-400" />
                <h2 className="text-base font-semibold text-white">Security &amp; Audit Trail</h2>
              </div>
              <NextLink
                href="/admin/audit-logs"
                className="text-xs text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="h-3 w-3" />
              </NextLink>
            </div>
            <p className="text-xs text-[#6F707E]">
              Live administrative events recorded by the platform
            </p>

            {auditLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-[#181820] rounded-xl" />
                ))}
              </div>
            ) : recentAudit.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F707E]">
                No audit events recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentAudit.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#16161D] border border-[#20202A] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-rose-400 font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          {log.resource}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E8F99] truncate mt-0.5">
                        {log.actor?.name || "Platform Admin"} · {log.ipAddress || "::1"}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#6F707E] shrink-0 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Database & Infrastructure Status */}
          <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 sm:p-6 space-y-4 min-w-0">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Database Infrastructure</h2>
            </div>
            <p className="text-xs text-[#6F707E]">
              TypeORM &amp; PostgreSQL live connection telemetry
            </p>

            {dbLoading ? (
              <Skeleton className="h-20 w-full bg-[#181820] rounded-xl" />
            ) : dbStatus ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#16161D] border border-[#20202A]">
                    <span className="text-[10px] text-[#6F707E] block">Connection</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {dbStatus.status?.toUpperCase() || "CONNECTED"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#16161D] border border-[#20202A]">
                    <span className="text-[10px] text-[#6F707E] block">Database</span>
                    <span className="font-semibold text-white font-mono mt-0.5 block truncate">
                      {dbStatus.databaseName}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#16161D] border border-[#20202A]">
                    <span className="text-[10px] text-[#6F707E] block">Engine</span>
                    <span className="font-semibold text-white font-mono mt-0.5 block truncate">
                      {dbStatus.postgresVersion || "PostgreSQL"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#16161D] border border-[#20202A]">
                    <span className="text-[10px] text-[#6F707E] block">DB User</span>
                    <span className="font-semibold text-white font-mono mt-0.5 block truncate">
                      {dbStatus.user}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#16161D] border border-[#20202A] flex items-center justify-between text-[11px] text-[#6F707E]">
                  <span>Server Clock</span>
                  <span className="font-mono text-white">
                    {dbStatus.serverTime ? new Date(dbStatus.serverTime).toUTCString() : "UTC"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-400">
                Database telemetry unavailable.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
