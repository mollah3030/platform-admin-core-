"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Shield,
  Search,
  MoreHorizontal,
  Key,
  Edit2,
  Trash2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CreateRoleDialog } from "@/components/admin/roles/create-role-dialog";
import { EditRoleDialog } from "@/components/admin/roles/edit-role-dialog";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { useRoles } from "@/hooks/queries/use-roles";
import { useDeleteRoleMutation } from "@/hooks/mutations/use-role-mutations";
import type { Role } from "@/resources/interfaces";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function RolesListView() {
  const [search, setSearch] = useState("");
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: roles = [], isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRoleMutation();

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRoleMutation.mutateAsync(roleToDelete.id);
      toast.success(`Role ${roleToDelete.name} deleted.`);
      setDeleteOpen(false);
      setRoleToDelete(null);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to delete role.");
    }
  };

  const filteredRoles = roles.filter((r) =>
    search
      ? r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Role Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Configure platform security roles and define granular permission policies.
          </p>
        </div>

        <PermissionGuard permission="roles.create">
          <CreateRoleDialog />
        </PermissionGuard>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6F707E]" />
          <Input
            type="search"
            placeholder="Search roles..."
            className="pl-9 text-xs h-9 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-[#7D7E8B]">
          {filteredRoles.length} role{filteredRoles.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Roles Table */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-[#181820]" />
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <Shield className="h-10 w-10 text-[#454652] mb-3" />
            <h3 className="text-base font-semibold text-white">No roles found</h3>
            <p className="text-xs text-[#7D7E8B] mt-1">
              {search ? "No roles match your search." : "No platform roles configured."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[650px]">

              <TableHeader>
                <TableRow className="border-b border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Role</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Description</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Permissions</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-right text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((r) => {
                  const isSuperAdmin = r.name === "SUPER_ADMIN";
                  const permCount = r.rolePermissions?.length ?? 0;

                  return (
                    <TableRow key={r.id} className="border-b border-[#1A1A22] hover:bg-[#16161D]/60 transition-colors">
                      <TableCell>
                        <NextLink
                          href={`/admin/roles/${r.id}`}
                          className="group flex items-center gap-2 font-mono font-semibold text-sm hover:underline"
                        >
                          {isSuperAdmin && <Lock className="h-3.5 w-3.5 text-amber-400" />}
                          <span className="text-white group-hover:text-rose-400">{r.name}</span>
                        </NextLink>
                      </TableCell>

                      <TableCell className="max-w-xs text-xs text-[#7D7E8B] truncate">
                        {r.description || "—"}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {permCount} permissions
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={r.isActive ? "success" : "secondary"}
                          className="text-[11px]"
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7D7E8B] hover:text-white hover:bg-white/[0.05]">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#14141A] border-[#22222C] text-[#E0E0E6]">
                            <DropdownMenuLabel className="text-xs text-[#7D7E8B]">Role Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#22222C]" />

                            <DropdownMenuItem asChild>
                              <NextLink href={`/admin/roles/${r.id}`} className="cursor-pointer hover:bg-white/5">
                                <Key className="mr-2 h-4 w-4 text-[#7D7E8B]" />
                                Manage Permissions
                              </NextLink>
                            </DropdownMenuItem>

                            <PermissionGuard permission="roles.update">
                              <DropdownMenuItem
                                onClick={() => {
                                  setRoleToEdit(r);
                                  setEditOpen(true);
                                }}
                                className="cursor-pointer hover:bg-white/5"
                              >
                                <Edit2 className="mr-2 h-4 w-4 text-[#7D7E8B]" />
                                Edit Definition
                              </DropdownMenuItem>
                            </PermissionGuard>

                            {!isSuperAdmin && (
                              <PermissionGuard permission="roles.delete">
                                <DropdownMenuSeparator className="bg-[#22222C]" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setRoleToDelete(r);
                                    setDeleteOpen(true);
                                  }}
                                  className="cursor-pointer text-rose-400 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Role
                                </DropdownMenuItem>
                              </PermissionGuard>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <EditRoleDialog role={roleToEdit} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#14141A] border-[#22222C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              Delete Role?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8E8F99]">
              Are you sure you want to delete role <strong className="text-white">{roleToDelete?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1A1A24] border-[#2A2A36] text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
