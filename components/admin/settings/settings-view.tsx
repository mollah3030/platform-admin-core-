"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Database,
  Lock,
  Loader2,
  CheckCircle2,
  Server,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Percent,
  Calendar,
  DollarSign,
  Save,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import { useDatabaseStatus } from "@/hooks/queries/use-database-status";
import { usePlatformSettings } from "@/hooks/queries/use-platform-settings";
import {
  useUpdateFeePercentMutation,
  useUpdateHoldDaysMutation,
  useUpdateMinimumPayoutMutation,
  useTriggerClearanceMutation,
  useTriggerPayoutCycleMutation,
} from "@/hooks/mutations/use-platform-settings-mutations";
import { useChangePasswordMutation } from "@/hooks/mutations/use-auth-mutations";
import {
  changePasswordSchema,
  type ChangePasswordSchemaType,
} from "@/resources/schemas/auth.schema";
import { appConfig } from "@/config/app.config";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function SettingsView() {
  const { user, isSuperAdmin } = useAuth();
  const { data: dbStatus, isLoading: dbLoading, refetch: refetchDb } = useDatabaseStatus();
  const {
    data: platformSettings,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = usePlatformSettings();

  const updateFeeMutation = useUpdateFeePercentMutation();
  const updateHoldMutation = useUpdateHoldDaysMutation();
  const updateMinPayoutMutation = useUpdateMinimumPayoutMutation();
  const triggerClearanceMutation = useTriggerClearanceMutation();
  const triggerPayoutCycleMutation = useTriggerPayoutCycleMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [feePercent, setFeePercent] = useState<number>(10);
  const [holdDays, setHoldDays] = useState<number>(14);
  const [minimumPayout, setMinimumPayout] = useState<number>(50);

  useEffect(() => {
    if (platformSettings) {
      if (platformSettings.platformFeePercent?.value !== undefined) {
        setFeePercent(Number(platformSettings.platformFeePercent.value));
      }
      if (platformSettings.sellerPayoutHoldDays?.value !== undefined) {
        setHoldDays(Number(platformSettings.sellerPayoutHoldDays.value));
      }
      if (platformSettings.minimumPayoutAmount?.value !== undefined) {
        setMinimumPayout(Number(platformSettings.minimumPayoutAmount.value));
      }
    }
  }, [platformSettings]);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSaveFee = async () => {
    try {
      await updateFeeMutation.mutateAsync({ feePercent });
      toast.success(`Platform commission updated to ${feePercent}%`);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to update platform fee percentage.");
    }
  };

  const handleSaveHoldDays = async () => {
    try {
      await updateHoldMutation.mutateAsync({ holdDays });
      toast.success(`Seller payout hold period updated to ${holdDays} days`);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to update hold days.");
    }
  };

  const handleSaveMinPayout = async () => {
    try {
      await updateMinPayoutMutation.mutateAsync({ minimumAmount: minimumPayout });
      toast.success(`Minimum payout threshold updated to $${minimumPayout}`);
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to update minimum payout amount.");
    }
  };

  const handleTriggerClearance = async () => {
    try {
      const res = await triggerClearanceMutation.mutateAsync();
      toast.success(
        res.message || `Cleared ${res.clearedCount} transactions ($${res.totalAmountCleared})`,
      );
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to run clearance engine.");
    }
  };

  const handleTriggerPayouts = async () => {
    try {
      const res = await triggerPayoutCycleMutation.mutateAsync();
      toast.success(
        `Disbursed payouts for ${res.payoutsCount} sellers ($${res.totalDisbursed})`,
      );
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to process payout cycle.");
    }
  };

  const onChangePasswordSubmit = async (values: ChangePasswordSchemaType) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password updated successfully.");
      reset();
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to change password.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#7D7E8B]">
          Marketplace commission rules, 14-day escrow hold policies, database telemetry, and security.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Marketplace Commission & Escrow Settings Card */}
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E1E26] pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Marketplace Commission & Escrow</h3>
                  <p className="text-[11px] text-[#7D7E8B]">Sellers receive payouts after 14-day hold with 10% fee</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchSettings()}
                className="h-7 px-2 text-[#7D7E8B] hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {settingsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full bg-[#181820]" />
                <Skeleton className="h-10 w-full bg-[#181820]" />
                <Skeleton className="h-10 w-full bg-[#181820]" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Platform Fee */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-[#A2A3B0] flex items-center gap-1.5">
                      <Percent className="h-3.5 w-3.5 text-emerald-400" />
                      Platform Commission Cut (%)
                    </Label>
                    <Badge variant="outline" className="bg-[#181820] text-emerald-400 border-[#22222C] text-[11px] font-mono">
                      Current: {platformSettings?.platformFeePercent?.value ?? 10}%
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      step={0.5}
                      value={feePercent}
                      onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                      className="bg-[#16161D] border-[#22222C] text-white font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveFee}
                      disabled={updateFeeMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                      {updateFeeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#6F707E]">
                    Deducted automatically from every order (e.g. 10% platform share, 90% seller share).
                  </p>
                </div>

                {/* Escrow Hold Days */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-[#A2A3B0] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      Seller Payout Clearance Hold (Days)
                    </Label>
                    <Badge variant="outline" className="bg-[#181820] text-amber-400 border-[#22222C] text-[11px] font-mono">
                      Current: {platformSettings?.sellerPayoutHoldDays?.value ?? 14} Days
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={90}
                      value={holdDays}
                      onChange={(e) => setHoldDays(parseInt(e.target.value, 10) || 0)}
                      className="bg-[#16161D] border-[#22222C] text-white font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveHoldDays}
                      disabled={updateHoldMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    >
                      {updateHoldMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#6F707E]">
                    Seller earnings remain in pending escrow for 14 days before clearance for payout disbursement.
                  </p>
                </div>

                {/* Minimum Payout Threshold */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-[#A2A3B0] flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-blue-400" />
                      Minimum Payout Disbursement Threshold ($)
                    </Label>
                    <Badge variant="outline" className="bg-[#181820] text-blue-400 border-[#22222C] text-[11px] font-mono">
                      Current: ${platformSettings?.minimumPayoutAmount?.value ?? 50}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={5}
                      max={10000}
                      value={minimumPayout}
                      onChange={(e) => setMinimumPayout(parseFloat(e.target.value) || 0)}
                      className="bg-[#16161D] border-[#22222C] text-white font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveMinPayout}
                      disabled={updateMinPayoutMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                    >
                      {updateMinPayoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#6F707E]">
                    Minimum cleared amount required before automated or scheduled vendor payouts occur.
                  </p>
                </div>

                {/* Manual Clearance & Payout Trigger Actions */}
                <div className="border-t border-[#1E1E26] pt-4 space-y-3">
                  <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                    Administrative Settlement Operations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTriggerClearance}
                      disabled={triggerClearanceMutation.isPending}
                      className="bg-[#16161D] border-[#22222C] text-[#A2A3B0] hover:text-white text-xs h-9 justify-start"
                    >
                      {triggerClearanceMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 text-amber-400" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                      )}
                      Run 14-Day Clearance
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTriggerPayouts}
                      disabled={triggerPayoutCycleMutation.isPending}
                      className="bg-[#16161D] border-[#22222C] text-[#A2A3B0] hover:text-white text-xs h-9 justify-start"
                    >
                      {triggerPayoutCycleMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 text-emerald-400" />
                      ) : (
                        <DollarSign className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                      )}
                      Process Payout Cycle
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-rose-400" />
              Administrator Identity
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between py-1.5 border-b border-[#1E1E26]">
                <span className="text-[#6F707E] font-medium">Name</span>
                <span className="font-semibold text-white">{user?.name || "Platform Admin"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E1E26]">
                <span className="text-[#6F707E] font-medium">Email</span>
                <span className="font-mono text-white">{user?.email || "admin@platform.com"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E1E26]">
                <span className="text-[#6F707E] font-medium">Clearance</span>
                <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-[10px] bg-rose-500/15 text-rose-400 border-rose-500/20">
                  {isSuperAdmin ? "SUPER ADMIN" : "STAFF"}
                </Badge>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6F707E] font-medium">ID</span>
                <span className="font-mono text-[#7D7E8B]">{user?.id || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-400" />
              Update Password
            </h3>

            <form onSubmit={handleSubmit(onChangePasswordSubmit)} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs text-[#A2A3B0]">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPass ? "text" : "password"}
                    className="pr-10 bg-[#16161D] border-[#22222C] text-white"
                    {...register("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-[#6F707E] hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-rose-400">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs text-[#A2A3B0]">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPass ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className="pr-10 bg-[#16161D] border-[#22222C] text-white"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-[#6F707E] hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-rose-400">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs text-[#A2A3B0]">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-[#16161D] border-[#22222C] text-white"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-9 font-medium"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Updating..." : "Save New Password"}
              </Button>
            </form>
          </div>

          {/* Database Card */}
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-rose-400" />
                PostgreSQL Connection
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchDb()}
                className="h-7 px-2 text-[#7D7E8B] hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {dbLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-[#181820]" />
                <Skeleton className="h-4 w-3/4 bg-[#181820]" />
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between py-1.5 border-b border-[#1E1E26]">
                  <span className="text-[#6F707E] font-medium">Status</span>
                  <div className="flex items-center gap-1.5">
                    {dbStatus?.status?.toLowerCase() === "connected" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-semibold text-emerald-400">ONLINE</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                        <span className="font-semibold text-rose-400">OFFLINE</span>
                      </>
                    )}
                  </div>
                </div>

                {dbStatus?.postgresVersion && (
                  <div className="flex items-center justify-between py-1.5 border-b border-[#1E1E26]">
                    <span className="text-[#6F707E] font-medium">Version</span>
                    <span className="text-[#A2A3B0]">{dbStatus.postgresVersion}</span>
                  </div>
                )}

                {dbStatus?.serverTime && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#6F707E] font-medium">DB Server Time</span>
                    <span className="font-mono text-[#A2A3B0]">{formatDate(dbStatus.serverTime)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* App Config Card */}
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-rose-400" />
              Platform Configuration
            </h3>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between py-1.5 border-b border-[#1E1E26]">
                <span className="text-[#6F707E] font-medium">Application</span>
                <span className="font-semibold text-white">{appConfig.app.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E1E26]">
                <span className="text-[#6F707E] font-medium">API Endpoint</span>
                <span className="font-mono text-[#A2A3B0]">{appConfig.env.NEXT_PUBLIC_API_URL}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6F707E] font-medium">Node Environment</span>
                <span className="font-mono uppercase text-white">{appConfig.env.NODE_ENV}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
