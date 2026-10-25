"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  updateRoleSchema,
  type UpdateRoleSchemaType,
} from "@/resources/schemas/role.schema";
import { useUpdateRoleMutation } from "@/hooks/mutations/use-role-mutations";
import type { Role } from "@/resources/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function EditRoleDialog({
  role,
  open,
  onOpenChange,
}: {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateRoleMutation = useUpdateRoleMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateRoleSchemaType>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || "",
        isActive: role.isActive,
      });
    }
  }, [role, reset]);

  const onSubmit = async (values: UpdateRoleSchemaType) => {
    if (!role) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: role.id,
        payload: {
          ...values,
          name: values.name ? values.name.trim().toUpperCase() : undefined,
        },
      });
      toast.success("Role updated successfully.");
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update role.");
      }
    }
  };

  const isSuperAdminRole = role?.name === "SUPER_ADMIN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update role definition and metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-role-name">Role Name</Label>
            <Input
              id="edit-role-name"
              disabled={isSuperAdminRole}
              className="uppercase font-mono"
              {...register("name")}
            />
            {isSuperAdminRole && (
              <p className="text-[11px] text-amber-600">
                The SUPER_ADMIN role cannot be renamed.
              </p>
            )}
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-role-desc">Description</Label>
            <Textarea id="edit-role-desc" {...register("description")} />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Is Active */}
          {!isSuperAdminRole && (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is-active" className="text-sm">
                  Active Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive roles cannot be assigned to new users
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
