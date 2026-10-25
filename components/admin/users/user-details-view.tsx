"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  ArrowLeft,
  Shield,
  Key,
  Calendar,
  Clock,
  Mail,
  ShieldPlus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditUserDialog } from "@/components/admin/users/edit-user-dialog";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { useUser } from "@/hooks/queries/use-user";
import { useRoles } from "@/hooks/queries/use-roles";
import { useAuditLogs } from "@/hooks/queries/use-audit-logs";
import {
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from "@/hooks/mutations/use-user-mutations";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function UserDetailsView({ id }: { id: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [roleToRemove, setRoleToRemove] = useState<{ id: string; name: string } | null>(null);

  const { data: user, isLoading: userLoading, error: userError } = useUser(id);
  const { data: allRoles = [] } = useRoles();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({
    actorUserId: id,
    limit: 10,
  });

  const assignRoleMutation = useAssignUserRoleMutation();
  const removeRoleMutation = useRemoveUserRoleMutation();
  const activateMutation = useActivateUserMutation();
  const deactivateMutation = useDeactivateUserMutation();

  const handleAssignRole = async () => {
    if (!selectedRoleId || !id) return;
    try {
      await assignRoleMutation.mutateAsync({
        userId: id,
        payload: { roleId: selectedRoleId },
      });
      toast.success("Role assigned to user.");
      setAssignRoleOpen(false);
      setSelectedRoleId("");
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to assign role.");
    }
  };

  const handleRemoveRole = async () => {
    if (!roleToRemove || !id) return;
    try {
      await removeRoleMutation.mutateAsync({
        userId: id,
        roleId: roleToRemove.id,
      });
      toast.success(`Role ${roleToRemove.name} removed from user.`);
      setRoleToRemove(null);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to remove role.");
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      if (user.status === "active") {
        await deactivateMutation.mutateAsync(user.id);
        toast.success("User account deactivated.");
      } else {
        await activateMutation.mutateAsync(user.id);
        toast.success("User account activated.");
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to change user status.");
    }
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-[#181820]" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-1 bg-[#181820]" />
          <Skeleton className="h-64 md:col-span-2 bg-[#181820]" />
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white">User Not Found</h2>
        <p className="text-xs text-[#7D7E8B] mt-1 mb-4">
          The requested user profile does not exist or may have been removed.
        </p>
        <Button asChild variant="outline" className="bg-[#16161D] border-[#22222C] text-white">
          <NextLink href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </NextLink>
        </Button>
      </div>
    );
  }

  const assignedRoleIds = new Set(user.userRoles?.map((ur) => ur.roleId));
  const availableRoles = allRoles.filter((r) => !assignedRoleIds.has(r.id));

  const effectivePermissionsMap = new Map<string, { key: string; resource: string; action: string }>();
  user.userRoles?.forEach((ur) => {
    ur.role?.rolePermissions?.forEach((rp) => {
      if (rp.permission) {
        effectivePermissionsMap.set(rp.permission.key, rp.permission);
      }
    });
  });
  const effectivePermissions = Array.from(effectivePermissionsMap.values());

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-[#14141A] border-[#22222C] text-[#8E8F99] hover:text-white">
            <NextLink href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </NextLink>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {user.name}
              </h1>
              <Badge
                variant={
                  user.status === "active"
                    ? "success"
                    : user.status === "suspended"
                    ? "destructive"
                    : "secondary"
                }
                className="capitalize text-xs"
              >
                {user.status}
              </Badge>
            </div>
            <p className="text-xs text-[#6F707E] font-mono mt-0.5">
              ID: {user.id}
            </p>
          </div>
        </div>

        <PermissionGuard permission="users.update">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="rounded-xl bg-[#14141A] border-[#22222C] text-white hover:bg-white/5"
            >
              <Edit2 className="mr-1.5 h-3.5 w-3.5 text-[#7D7E8B]" />
              Edit User
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={activateMutation.isPending || deactivateMutation.isPending}
              className="rounded-xl bg-[#14141A] border-[#22222C] text-white hover:bg-white/5"
            >
              {user.status === "active" ? (
                <>
                  <XCircle className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </PermissionGuard>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: User Card */}
        <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4 text-xs md:col-span-1">
          <div className="space-y-1">
            <span className="text-[#6F707E] font-semibold uppercase tracking-wider text-[10px]">Full Name</span>
            <p className="font-semibold text-sm text-white">{user.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6F707E] font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
            <p className="font-mono text-white flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#6F707E]" />
              {user.email}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6F707E] font-semibold uppercase tracking-wider text-[10px]">Registered On</span>
            <p className="text-[#A2A3B0] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#6F707E]" />
              {formatDate(user.createdAt)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6F707E] font-semibold uppercase tracking-wider text-[10px]">Last Login</span>
            <p className="text-[#A2A3B0] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#6F707E]" />
              {formatDate(user.lastLoginAt)}
            </p>
          </div>
        </div>

        {/* Right Column: Roles & Permissions Tabs */}
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="bg-[#121217] border border-[#1E1E26] p-1 rounded-xl">
              <TabsTrigger value="roles" className="text-xs data-[state=active]:bg-[#1E1E28] data-[state=active]:text-white">
                Assigned Roles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="text-xs data-[state=active]:bg-[#1E1E28] data-[state=active]:text-white">
                Effective Permissions ({effectivePermissions.length})
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs data-[state=active]:bg-[#1E1E28] data-[state=active]:text-white">
                Activity History
              </TabsTrigger>
            </TabsList>

            {/* Roles Tab */}
            <TabsContent value="roles" className="pt-2">
              <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Assigned Security Roles</h3>
                    <p className="text-xs text-[#6F707E]">Access levels granted to this account</p>
                  </div>

                  <PermissionGuard permission="users.update">
                    <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-8 text-xs">
                          <ShieldPlus className="mr-1.5 h-3.5 w-3.5" />
                          Assign Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#14141A] border-[#22222C] text-white">
                        <DialogHeader>
                          <DialogTitle>Assign Role to {user.name}</DialogTitle>
                          <DialogDescription className="text-[#8E8F99]">
                            Select an access role to grant to this administrative user.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-3">
                          {availableRoles.length === 0 ? (
                            <p className="text-xs text-[#8E8F99]">
                              All available platform roles have already been assigned.
                            </p>
                          ) : (
                            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                              <SelectTrigger className="bg-[#16161D] border-[#22222C] text-white">
                                <SelectValue placeholder="Choose a role..." />
                              </SelectTrigger>
                              <SelectContent className="bg-[#14141A] border-[#22222C] text-white">
                                {availableRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAssignRoleOpen(false)} className="bg-[#1A1A24] border-[#2A2A36] text-white">
                            Cancel
                          </Button>
                          <Button
                            disabled={!selectedRoleId || assignRoleMutation.isPending}
                            onClick={handleAssignRole}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Assign Role
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </PermissionGuard>
                </div>

                {!user.userRoles || user.userRoles.length === 0 ? (
                  <p className="text-xs text-[#6F707E] py-6 text-center">No roles currently assigned</p>
                ) : (
                  <div className="space-y-2.5">
                    {user.userRoles.map((ur) => (
                      <div
                        key={ur.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#16161D] border border-[#20202A]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white font-mono">
                              {ur.role?.name}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {ur.role?.rolePermissions?.length || 0} permissions
                            </Badge>
                          </div>
                          <p className="text-xs text-[#7D7E8B] mt-0.5">
                            {ur.role?.description || "No description"}
                          </p>
                        </div>

                        <PermissionGuard permission="users.update">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setRoleToRemove({ id: ur.roleId, name: ur.role?.name || "Role" })
                            }
                            className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 h-8 px-2 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </PermissionGuard>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Effective Permissions Tab */}
            <TabsContent value="permissions" className="pt-2">
              <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Effective Permissions</h3>
                <p className="text-xs text-[#6F707E] mb-4">
                  Aggregated permissions enabled across all active roles for this user
                </p>

                {effectivePermissions.length === 0 ? (
                  <p className="text-xs text-[#6F707E] py-6 text-center">No permissions assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {effectivePermissions.map((perm) => (
                      <Badge
                        key={perm.key}
                        variant="secondary"
                        className="font-mono text-xs py-1 px-2.5 bg-[#16161D] border border-[#22222C] text-[#C2C3D0] flex items-center gap-1.5"
                      >
                        <Key className="h-3 w-3 text-rose-400" />
                        {perm.key}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Audit Tab */}
            <TabsContent value="audit" className="pt-2">
              <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Audit Stream</h3>
                <p className="text-xs text-[#6F707E] mb-4">Latest activities initiated by this user</p>

                {auditLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full bg-[#181820]" />
                    ))}
                  </div>
                ) : auditData?.data.length === 0 ? (
                  <p className="text-xs text-[#6F707E] py-6 text-center">No audit logs recorded for this user.</p>
                ) : (
                  <div className="space-y-2.5">
                    {auditData?.data.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-[#16161D] border border-[#20202A] flex items-center justify-between text-xs"
                      >
                        <div>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            {log.action}
                          </Badge>
                          <span className="text-[#A2A3B0] ml-2 font-mono">
                            {log.resource}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6F707E]">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditUserDialog user={user} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog
        open={Boolean(roleToRemove)}
        onOpenChange={(open) => !open && setRoleToRemove(null)}
      >
        <AlertDialogContent className="bg-[#14141A] border-[#22222C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8E8F99]">
              Are you sure you want to remove role <strong>{roleToRemove?.name}</strong> from {user.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1A1A24] border-[#2A2A36] text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRole}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
