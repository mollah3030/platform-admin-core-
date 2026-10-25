import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  createPermissionAction,
  updatePermissionAction,
  deletePermissionAction,
} from "@/resources/actions/permissions.actions";
import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/resources/interfaces";

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionRequest) =>
      createPermissionAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.lists() });
    },
  });
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePermissionRequest;
    }) => updatePermissionAction(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.lists() });
    },
  });
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePermissionAction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.permissions.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.lists() });
    },
  });
}
