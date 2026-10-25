"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldPlus, Loader2 } from "lucide-react";
import {
  createRoleSchema,
  type CreateRoleSchemaType,
} from "@/resources/schemas/role.schema";
import { useCreateRoleMutation } from "@/hooks/mutations/use-role-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function CreateRoleDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const createRoleMutation = useCreateRoleMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleSchemaType>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateRoleSchemaType) => {
    try {
      await createRoleMutation.mutateAsync({
        ...values,
        name: values.name.trim().toUpperCase(),
      });
      toast.success(`Role ${values.name.toUpperCase()} created successfully.`);
      reset();
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create role.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <ShieldPlus className="mr-1.5 h-4 w-4" />
            Create Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Security Role</DialogTitle>
          <DialogDescription>
            Define a new access role. Permissions can be assigned after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Role Name */}
          <div className="space-y-1.5">
            <Label htmlFor="role-name">Role Name (Identifier)</Label>
            <Input
              id="role-name"
              placeholder="e.g. OPERATIONS_MANAGER"
              className="uppercase font-mono"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Uppercase letters and underscores recommended.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea
              id="role-desc"
              placeholder="Brief description of responsibilities and access scope..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
