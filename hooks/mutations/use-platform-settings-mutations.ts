import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { settingsApi } from "@/resources/apis/settings.api";
import { payoutsApi } from "@/resources/apis/payouts.api";
import type {
  UpdatePlatformFeeDto,
  UpdateHoldDaysDto,
  UpdateMinimumPayoutDto,
} from "@/resources/interfaces/settings.interface";

export function useUpdateFeePercentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePlatformFeeDto) => settingsApi.updateFeePercent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

export function useUpdateHoldDaysMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateHoldDaysDto) => settingsApi.updateHoldDays(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

export function useUpdateMinimumPayoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateMinimumPayoutDto) => settingsApi.updateMinimumPayout(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

export function useTriggerClearanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payoutsApi.triggerClearance(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

export function useTriggerPayoutCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payoutsApi.triggerPayoutCycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}
