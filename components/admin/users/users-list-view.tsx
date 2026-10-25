"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
import { EditUserDialog } from "@/components/admin/users/edit-user-dialog";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { useUsers } from "@/hooks/queries/use-users";
import {
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from "@/hooks/mutations/use-user-mutations";
import type { User, UserStatus } from "@/resources/interfaces";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function UsersListView() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [statusTarget, setStatusTarget] = useState<{
    user: User;
    action: "activate" | "deactivate";
  } | null>(null);

  const { data, isLoading, isPlaceholderData } = useUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as UserStatus) : undefined,
  });

  const deleteUserMutation = useDeleteUserMutation();
  const activateUserMutation = useActivateUserMutation();
  const deactivateUserMutation = useDeactivateUserMutation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast.success(`User ${userToDelete.name} deleted.`);
      setDeleteOpen(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to delete user.");
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    try {
      if (statusTarget.action === "activate") {
        await activateUserMutation.mutateAsync(statusTarget.user.id);
        toast.success(`User ${statusTarget.user.name} activated.`);
      } else {
        await deactivateUserMutation.mutateAsync(statusTarget.user.id);
        toast.success(`User ${statusTarget.user.name} deactivated.`);
      }
      setStatusTarget(null);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Status update failed.");
    }
  };

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const users = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Manage platform accounts, security clearance, and role assignments.
          </p>
        </div>

        <PermissionGuard permission="users.create">
          <CreateUserDialog />
        </PermissionGuard>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6F707E]" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-9 text-xs h-9 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-9 rounded-xl bg-[#1C1C26] hover:bg-[#242432] text-xs text-white">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-[#16161D] border-[#22222C] text-[#E0E0E6]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-[#E0E0E6]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {(debouncedSearch || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-9 px-2 text-[#7D7E8B] hover:text-white"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-[#181820]" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <Users className="h-10 w-10 text-[#454652] mb-3" />
            <h3 className="text-base font-semibold text-white">No users found</h3>
            <p className="text-xs text-[#7D7E8B] mt-1 max-w-sm">
              {debouncedSearch || statusFilter !== "all"
                ? "No users matched your search criteria."
                : "No users registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[700px]">

              <TableHeader>
                <TableRow className="border-b border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">User</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Last Activity</TableHead>
                  <TableHead className="text-right text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-b border-[#1A1A22] hover:bg-[#16161D]/60 transition-colors">
                    <TableCell>
                      <NextLink
                        href={`/admin/users/${u.id}`}
                        className="group flex flex-col hover:underline"
                      >
                        <span className="font-semibold text-sm text-white group-hover:text-rose-400">
                          {u.name}
                        </span>
                        <span className="text-xs text-[#7D7E8B] font-mono">
                          {u.email}
                        </span>
                      </NextLink>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          u.status === "active"
                            ? "success"
                            : u.status === "suspended"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize text-[11px]"
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </TableCell>

                    <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                      {formatDate(u.lastLoginAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7D7E8B] hover:text-white hover:bg-white/[0.05]">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#14141A] border-[#22222C] text-[#E0E0E6]">
                          <DropdownMenuLabel className="text-xs text-[#7D7E8B]">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#22222C]" />

                          <DropdownMenuItem asChild>
                            <NextLink
                              href={`/admin/users/${u.id}`}
                              className="cursor-pointer hover:bg-white/5"
                            >
                              <Eye className="mr-2 h-4 w-4 text-[#7D7E8B]" />
                              View Profile
                            </NextLink>
                          </DropdownMenuItem>

                          <PermissionGuard permission="users.update">
                            <DropdownMenuItem
                              onClick={() => {
                                setUserToEdit(u);
                                setEditOpen(true);
                              }}
                              className="cursor-pointer hover:bg-white/5"
                            >
                              <Edit2 className="mr-2 h-4 w-4 text-[#7D7E8B]" />
                              Edit Details
                            </DropdownMenuItem>

                            {u.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusTarget({ user: u, action: "deactivate" })
                                }
                                className="cursor-pointer text-amber-400 hover:bg-amber-500/10"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusTarget({ user: u, action: "activate" })
                                }
                                className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </PermissionGuard>

                          <PermissionGuard permission="users.delete">
                            <DropdownMenuSeparator className="bg-[#22222C]" />
                            <DropdownMenuItem
                              onClick={() => {
                                setUserToDelete(u);
                                setDeleteOpen(true);
                              }}
                              className="cursor-pointer text-rose-400 hover:bg-rose-500/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1E1E26] px-5 py-3.5 text-xs text-[#7D7E8B]">
            <div>
              Showing <span className="font-semibold text-white">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold text-white">{Math.min(page * limit, total)}</span> of{" "}
              <span className="font-semibold text-white">{total}</span> users
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isPlaceholderData}
                className="h-8 px-2.5 text-xs rounded-lg bg-[#16161D] border-[#22222C] text-[#E0E0E6]"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="px-2 font-medium text-white">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isPlaceholderData}
                className="h-8 px-2.5 text-xs rounded-lg bg-[#16161D] border-[#22222C] text-[#E0E0E6]"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EditUserDialog
        user={userToEdit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#14141A] border-[#22222C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8E8F99]">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">{userToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1A1A24] border-[#2A2A36] text-white hover:bg-[#222230]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
      >
        <AlertDialogContent className="bg-[#14141A] border-[#22222C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.action === "activate" ? "Activate User" : "Deactivate User"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8E8F99]">
              Are you sure you want to {statusTarget?.action}{" "}
              <strong className="text-white">{statusTarget?.user.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1A1A24] border-[#2A2A36] text-white hover:bg-[#222230]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
