import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  loginAction,
  logoutAction,
  changePasswordAction,
} from "@/resources/actions/auth.actions";
import type { LoginRequest, ChangePasswordRequest } from "@/resources/interfaces";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginRequest) => loginAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logoutAction(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePasswordAction(payload),
  });
}
