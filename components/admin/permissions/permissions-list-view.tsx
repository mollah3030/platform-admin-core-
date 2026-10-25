"use client";

import React, { useState } from "react";
import {
  Key,
  Search,
  Trash2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreatePermissionDialog } from "@/components/admin/permissions/create-permission-dialog";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { usePermissions } from "@/hooks/queries/use-permissions";
import { useDeletePermissionMutation } from "@/hooks/mutations/use-permission-mutations";
import type { Permission } from "@/resources/interfaces";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function PermissionsListView() {
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [permToDelete, setPermToDelete] = useState<Permission | null>(null);

  const { data: permissions = [], isLoading } = usePermissions();
  const deleteMutation = useDeletePermissionMutation();

  const resources = Array.from(new Set(permissions.map((p) => p.resource))).sort();

  const filteredPermissions = permissions.filter((p) => {
    const matchesSearch = search
      ? p.key.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesResource =
      resourceFilter === "all" ? true : p.resource === resourceFilter;
    return matchesSearch && matchesResource;
  });

  const handleDelete = async () => {
    if (!permToDelete) return;
    try {
      await deleteMutation.mutateAsync(permToDelete.id);
      toast.success(`Permission ${permToDelete.key} deleted.`);
      setPermToDelete(null);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to delete permission.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Permission Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Granular permission keys and authorization policies enforced by the backend.
          </p>
        </div>

        <PermissionGuard permission="permissions.create">
          <CreatePermissionDialog />
        </PermissionGuard>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6F707E]" />
          <Input
            type="search"
            placeholder="Search permissions..."
            className="pl-9 text-xs h-9 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl bg-[#16161D] border-[#22222C] text-[#E0E0E6]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-[#E0E0E6]">
              <SelectItem value="all">All Modules</SelectItem>
              {resources.map((res) => (
                <SelectItem key={res} value={res} className="capitalize">
                  {res}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || resourceFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setResourceFilter("all");
              }}
              className="text-xs h-9 px-2 text-[#7D7E8B] hover:text-white"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Permissions Table */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-[#181820]" />
            ))}
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <Key className="h-10 w-10 text-[#454652] mb-3" />
            <h3 className="text-base font-semibold text-white">No permissions found</h3>
            <p className="text-xs text-[#7D7E8B] mt-1">
              {search || resourceFilter !== "all"
                ? "No permissions matched your filter criteria."
                : "No permissions registered."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[650px]">

              <TableHeader>
                <TableRow className="border-b border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Key</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Module</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Action</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Description</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-right text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((perm) => (
                  <TableRow key={perm.id} className="border-b border-[#1A1A22] hover:bg-[#16161D]/60 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-white">
                      {perm.key}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[11px]">
                        {perm.resource}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-mono">
                        {perm.action}
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-xs text-xs text-[#7D7E8B] truncate">
                      {perm.description || "—"}
                    </TableCell>

                    <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                      {formatDate(perm.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <PermissionGuard permission="permissions.delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPermToDelete(perm)}
                          className="h-8 w-8 text-[#7D7E8B] hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </PermissionGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog
        open={Boolean(permToDelete)}
        onOpenChange={(open) => !open && setPermToDelete(null)}
      >
        <AlertDialogContent className="bg-[#14141A] border-[#22222C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              Delete Permission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8E8F99]">
              Are you sure you want to delete permission key{" "}
              <code className="font-mono font-bold text-white">{permToDelete?.key}</code>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1A1A24] border-[#2A2A36] text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permission"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
