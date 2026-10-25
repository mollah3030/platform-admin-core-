"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  ArrowLeft,
  Key,
  Lock,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/hooks/queries/use-role";
import { usePermissions } from "@/hooks/queries/use-permissions";
import {
  useAssignRolePermissionMutation,
  useRemoveRolePermissionMutation,
} from "@/hooks/mutations/use-role-mutations";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";
import type { Permission } from "@/resources/interfaces";

export function RoleDetailsView({ id }: { id: string }) {
  const [pendingPermId, setPendingPermId] = useState<string | null>(null);

  const { data: role, isLoading: roleLoading, error: roleError } = useRole(id);
  const { data: allPermissions = [], isLoading: permsLoading } = usePermissions();

  const assignMutation = useAssignRolePermissionMutation();
  const removeMutation = useRemoveRolePermissionMutation();

  const isSuperAdminRole = role?.name === "SUPER_ADMIN";

  const assignedPermIds = new Set(
    role?.rolePermissions?.map((rp) => rp.permissionId) || [],
  );

  const groupedPermissions: Record<string, Permission[]> = {};
  allPermissions.forEach((perm) => {
    const res = perm.resource || "general";
    if (!groupedPermissions[res]) groupedPermissions[res] = [];
    groupedPermissions[res].push(perm);
  });

  const handleTogglePermission = async (permissionId: string) => {
    if (isSuperAdminRole) {
      toast.info("The SUPER_ADMIN role retains all platform permissions permanently.");
      return;
    }

    setPendingPermId(permissionId);
    const isCurrentlyAssigned = assignedPermIds.has(permissionId);

    try {
      if (isCurrentlyAssigned) {
        await removeMutation.mutateAsync({ roleId: id, permissionId });
        toast.success("Permission removed from role.");
      } else {
        await assignMutation.mutateAsync({ roleId: id, payload: { permissionId } });
        toast.success("Permission granted to role.");
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to update permission.");
    } finally {
      setPendingPermId(null);
    }
  };

  const handleGroupSelectAll = async (perms: Permission[]) => {
    if (isSuperAdminRole) return;
    const toAdd = perms.filter((p) => !assignedPermIds.has(p.id));
    if (toAdd.length === 0) return;

    for (const p of toAdd) {
      try {
        await assignMutation.mutateAsync({ roleId: id, payload: { permissionId: p.id } });
      } catch {}
    }
    toast.success(`Granted ${toAdd.length} permissions to ${role?.name}.`);
  };

  const handleGroupClearAll = async (perms: Permission[]) => {
    if (isSuperAdminRole) return;
    const toRemove = perms.filter((p) => assignedPermIds.has(p.id));
    if (toRemove.length === 0) return;

    for (const p of toRemove) {
      try {
        await removeMutation.mutateAsync({ roleId: id, permissionId: p.id });
      } catch {}
    }
    toast.success(`Removed ${toRemove.length} permissions from ${role?.name}.`);
  };

  if (roleLoading || permsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-[#181820]" />
        <Skeleton className="h-32 w-full bg-[#181820]" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full bg-[#181820]" />
          ))}
        </div>
      </div>
    );
  }

  if (roleError || !role) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white">Role Not Found</h2>
        <Button asChild variant="outline" className="mt-4 bg-[#16161D] border-[#22222C] text-white">
          <NextLink href="/admin/roles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </NextLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-[#14141A] border-[#22222C] text-[#8E8F99] hover:text-white">
            <NextLink href="/admin/roles">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </NextLink>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                {role.name}
              </h1>
              {isSuperAdminRole && (
                <Badge variant="default" className="text-xs gap-1 bg-amber-500/15 text-amber-400 border-amber-500/20">
                  <Lock className="h-3 w-3" />
                  SUPER_ADMIN
                </Badge>
              )}
              <Badge variant={role.isActive ? "success" : "secondary"} className="text-xs">
                {role.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-[#7D7E8B] mt-0.5">
              {role.description || "No description provided."}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs py-1.5 px-3 font-mono bg-[#14141A] border-[#22222C] text-white">
          {assignedPermIds.size} of {allPermissions.length} permissions granted
        </Badge>
      </div>

      {isSuperAdminRole && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs">
          <Info className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[#A2A3B0]">
            <span className="font-semibold text-white">Protected Platform Role:</span>{" "}
            The <code className="font-mono text-rose-400">SUPER_ADMIN</code> role automatically holds full permissions across all platform modules.
          </div>
        </div>
      )}

      {/* Permission Groups Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">
          Granular Permission Matrix
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {Object.entries(groupedPermissions).map(([resource, perms]) => {
            const groupAssignedCount = perms.filter((p) => assignedPermIds.has(p.id)).length;
            const isAllGroupAssigned = groupAssignedCount === perms.length;

            return (
              <div key={resource} className="rounded-2xl border border-[#1E1E26] bg-[#121217] overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between p-4 bg-[#15151C] border-b border-[#1E1E26]">
                  <div>
                    <h3 className="text-sm font-semibold capitalize text-white flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-rose-400" />
                      {resource} Module
                    </h3>
                    <p className="text-[11px] text-[#6F707E]">
                      {groupAssignedCount} of {perms.length} granted
                    </p>
                  </div>

                  {!isSuperAdminRole && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGroupSelectAll(perms)}
                        disabled={isAllGroupAssigned}
                        className="h-7 text-xs px-2 text-[#8E8F99] hover:text-white"
                      >
                        Select all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGroupClearAll(perms)}
                        disabled={groupAssignedCount === 0}
                        className="h-7 text-xs px-2 text-[#6F707E] hover:text-white"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-[#1A1A22] p-0 flex-1">
                  {perms.map((perm) => {
                    const isChecked = isSuperAdminRole || assignedPermIds.has(perm.id);
                    const isPending = pendingPermId === perm.id;

                    return (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-3.5 hover:bg-[#16161D]/50 transition-colors"
                      >
                        <div className="space-y-0.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-white">
                              {perm.key}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-mono capitalize">
                              {perm.action}
                            </Badge>
                          </div>
                          {perm.description && (
                            <p className="text-xs text-[#7D7E8B]">{perm.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isPending && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#7D7E8B]" />
                          )}
                          <Switch
                            checked={isChecked}
                            disabled={isSuperAdminRole || isPending}
                            onCheckedChange={() => handleTogglePermission(perm.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
