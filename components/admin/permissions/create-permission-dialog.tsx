"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import {
  createPermissionSchema,
  type CreatePermissionSchemaType,
} from "@/resources/schemas/permission.schema";
import { useCreatePermissionMutation } from "@/hooks/mutations/use-permission-mutations";
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

export function CreatePermissionDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreatePermissionMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePermissionSchemaType>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      key: "",
      resource: "",
      action: "",
      description: "",
    },
  });

  const resource = watch("resource");
  const action = watch("action");

  // Auto-compose key when resource or action changes
  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const res = e.target.value.toLowerCase().replace(/[^a-z_]/g, "");
    setValue("resource", res, { shouldValidate: true });
    if (action) {
      setValue("key", `${res}.${action}`, { shouldValidate: true });
    }
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const act = e.target.value.toLowerCase().replace(/[^a-z_]/g, "");
    setValue("action", act, { shouldValidate: true });
    if (resource) {
      setValue("key", `${resource}.${act}`, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: CreatePermissionSchemaType) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(`Permission ${values.key} created.`);
      reset();
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create permission.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <KeyRound className="mr-1.5 h-4 w-4" />
            New Permission
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Permission</DialogTitle>
          <DialogDescription>
            Add a granular permission key to the platform access registry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Resource */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="perm-resource">Resource (Module)</Label>
              <Input
                id="perm-resource"
                placeholder="e.g. stores"
                {...register("resource")}
                onChange={handleResourceChange}
              />
              {errors.resource && (
                <p className="text-xs text-destructive">
                  {errors.resource.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="perm-action">Action</Label>
              <Input
                id="perm-action"
                placeholder="e.g. export"
                {...register("action")}
                onChange={handleActionChange}
              />
              {errors.action && (
                <p className="text-xs text-destructive">
                  {errors.action.message}
                </p>
              )}
            </div>
          </div>

          {/* Key */}
          <div className="space-y-1.5">
            <Label htmlFor="perm-key">Permission Key</Label>
            <Input
              id="perm-key"
              placeholder="e.g. stores.export"
              className="font-mono text-sm"
              {...register("key")}
            />
            {errors.key && (
              <p className="text-xs text-destructive">{errors.key.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground font-mono">
              Format: resource.action (lowercase)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="perm-desc">Description</Label>
            <Textarea
              id="perm-desc"
              placeholder="What does this permission allow administrators to do?"
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Save Permission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
