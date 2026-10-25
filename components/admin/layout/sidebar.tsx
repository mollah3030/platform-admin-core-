"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Store,
  Package,
  Users,
  ShieldCheck,
  Key,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronsUpDown,
  Shield,
  Layers,
  FolderTree,
  Wallet,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Stores / Tenants",
    href: "/admin/stores",
    icon: Store,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Catalog Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Payouts & Settlement",
    href: "/admin/payouts",
    icon: Wallet,
  },
  {
    title: "Invoices",
    href: "/admin/invoices",
    icon: Receipt,
  },
  {
    title: "Platform Users",
    href: "/admin/users",
    icon: Users,
    permission: "users.read",
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: ShieldCheck,
    permission: "roles.read",
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
    icon: Key,
    permission: "permissions.read",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
    permission: "audit.read",
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, isSuperAdmin, hasPermission } = useAuth();

  const filteredItems = navItems.filter((item) =>
    item.permission ? hasPermission(item.permission) : true,
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-[#1D1D24] bg-[#0E0E12] transition-all duration-300 relative select-none z-30 shrink-0",
          collapsed ? "w-20" : "w-64",
        )}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-16 items-center px-4 border-b border-[#1D1D24]/80">
          <NextLink
            href="/admin/dashboard"
            className="flex items-center gap-3 overflow-hidden font-semibold w-full"
          >
            {/* Logo Badge */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold shadow-md shadow-rose-950/40 border border-rose-400/25">
              <Layers className="h-4 w-4 text-white" />
            </div>

            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-bold text-white tracking-tight truncate leading-tight">
                  Company Name
                </span>
                <span className="text-[9px] font-semibold text-[#6E6F7C] uppercase tracking-wider font-mono">
                  PLATFORM WORKSPACE
                </span>
              </div>
            )}
          </NextLink>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <NextLink
                      href={item.href}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all mx-auto",
                        isActive
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm"
                          : "text-[#8E8F99] hover:text-white hover:bg-white/[0.04]",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="sr-only">{item.title}</span>
                    </NextLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#181820] text-white border-[#2A2A36]">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <NextLink
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all group",
                  isActive
                    ? "bg-rose-500/10 text-white font-semibold border-l-2 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.08)]"
                    : "text-[#8E8F99] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-rose-400" : "text-[#7B7C87] group-hover:text-white",
                  )}
                />
                <span className="truncate">{item.title}</span>
              </NextLink>
            );
          })}
        </div>

        {/* Bottom Platform Admin Info & Collapse */}
        <div className="p-3 border-t border-[#1D1D24] space-y-2">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#14141A] border border-[#20202A] text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.name || "Platform Admin"}
                  </span>
                  <span className="text-[10px] text-[#6E6F7C] truncate font-medium">
                    {isSuperAdmin ? "Super Admin" : "Platform Staff"}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-[#6E6F7C] shrink-0" />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-xs">
                <Shield className="h-4 w-4" />
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 text-[#7B7C87] hover:text-white hover:bg-white/[0.04] h-7 text-xs"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, isSuperAdmin, hasPermission } = useAuth();

  const filteredItems = navItems.filter((item) =>
    item.permission ? hasPermission(item.permission) : true,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-[#8E8F99] hover:text-white hover:bg-white/5 h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-[#0E0E12] border-r border-[#1D1D24]">
        <SheetHeader className="p-4 border-b border-[#1D1D24] text-left">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold shadow-md shadow-rose-950/40 border border-rose-400/25">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white">
                Company Name
              </span>
              <span className="text-[10px] text-[#6E6F7C] uppercase font-mono font-semibold">
                PLATFORM WORKSPACE
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <NextLink
                key={item.title}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all min-h-[44px]",
                  isActive
                    ? "bg-rose-500/10 text-white font-semibold border-l-2 border-rose-500 shadow-sm"
                    : "text-[#8E8F99] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-rose-400" : "text-[#7B7C87]",
                  )}
                />
                <span>{item.title}</span>
              </NextLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#1D1D24]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#14141A] border border-[#20202A] text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-xs">
                <Shield className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.name || "Platform Admin"}
                </span>
                <span className="text-[10px] text-[#6E6F7C] truncate font-medium">
                  {isSuperAdmin ? "Super Admin" : "Platform Staff"}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-[#6E6F7C] shrink-0" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
