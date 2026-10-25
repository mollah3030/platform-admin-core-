"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Sun,
  Moon,
  Database,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useDatabaseStatus } from "@/hooks/queries/use-database-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MobileSidebar } from "./sidebar";
import { getInitials } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isSuperAdmin, logout } = useAuth();
  const { data: dbStatus } = useDatabaseStatus();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Build breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  // e.g. ["admin", "users", "123"]

  const breadcrumbs = pathSegments.map((seg, idx) => {
    const href = "/" + pathSegments.slice(0, idx + 1).join("/");
    let label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    if (seg === "admin") label = "Admin";
    if (seg.length > 20) label = "Details"; // UUID or long id
    return { href, label, isLast: idx === pathSegments.length - 1 };
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#1D1D24] bg-[#0B0B0E]/95 px-4 sm:px-6 lg:px-8 2xl:px-10 backdrop-blur-md transition-all">
      {/* Left side: Mobile menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <MobileSidebar />

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList className="text-[#6F707E]">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <BreadcrumbSeparator className="text-[#454652]" />}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="font-semibold text-white">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <NextLink href={crumb.href} className="text-[#8E8F99] hover:text-white transition-colors">
                        {crumb.label}
                      </NextLink>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side: Search, System Status, Notifications & User menu */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 sm:w-60 lg:w-72 xl:w-80 transition-all">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6F707E]" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 h-9 text-xs rounded-xl bg-[#14141A] border-[#22222C] text-white placeholder:text-[#6F707E] focus-visible:ring-1 focus-visible:ring-rose-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Database Status Indicator */}
        {dbStatus && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#14141A] border border-[#22222C] text-xs font-medium">
            <Database className="h-3.5 w-3.5 text-[#6F707E]" />
            <span className="text-[#6F707E]">DB:</span>
            {dbStatus.databaseConnected ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Error
              </span>
            )}
          </div>
        )}

        {/* Sun theme icon matching screenshot */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-[#7E7F8F] hover:text-white hover:bg-white/[0.04]"
          title="Theme Toggle"
        >
          <Sun className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Bell notifications matching screenshot */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-xl text-[#7E7F8F] hover:text-white hover:bg-white/[0.04]"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2.5 pl-2 pr-3 py-1.5 h-auto rounded-full hover:bg-white/[0.04]"
            >
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarFallback className="bg-rose-500/10 text-rose-400 text-xs font-semibold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white line-clamp-1">
                    {user?.name || "Admin"}
                  </span>
                  {isSuperAdmin && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-rose-500/20 text-rose-300 border-rose-500/30">
                      Super
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-[#6F707E] line-clamp-1">
                  {user?.email || "admin@platform.com"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#14141A] border-[#22222C] text-[#E0E0E6]">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-white">{user?.name || "Platform Admin"}</p>
                <p className="text-xs text-[#7D7E8B] truncate">
                  {user?.email || "admin@platform.com"}
                </p>
                <div className="pt-1">
                  <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-[10px] bg-rose-500/20 text-rose-300 border-rose-500/30">
                    {isSuperAdmin ? "SUPER ADMIN" : "STAFF"}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#22222C]" />
            <DropdownMenuItem asChild>
              <NextLink href="/admin/settings" className="cursor-pointer hover:bg-white/5">
                <UserIcon className="mr-2 h-4 w-4 text-[#7D7E8B]" />
                Profile & Settings
              </NextLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NextLink href="/admin/roles" className="cursor-pointer hover:bg-white/5">
                <Shield className="mr-2 h-4 w-4 text-[#7D7E8B]" />
                Access Roles
              </NextLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#22222C]" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
