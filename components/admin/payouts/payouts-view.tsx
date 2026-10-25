"use client";

import React, { useState } from "react";
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
  Loader2,
  TrendingUp,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformRevenue, usePayouts } from "@/hooks/queries/use-payouts";
import {
  useTriggerClearanceMutation,
  useTriggerPayoutCycleMutation,
} from "@/hooks/mutations/use-platform-settings-mutations";
import type { PayoutStatus } from "@/resources/interfaces/payout.interface";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function PayoutsView() {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data: revenueData,
    isLoading: revenueLoading,
    refetch: refetchRevenue,
  } = usePlatformRevenue();

  const {
    data: payoutsData,
    isLoading: payoutsLoading,
    refetch: refetchPayouts,
  } = usePayouts({
    page,
    limit: 10,
    status: statusFilter === "ALL" ? undefined : (statusFilter as PayoutStatus),
  });

  const triggerClearanceMutation = useTriggerClearanceMutation();
  const triggerPayoutCycleMutation = useTriggerPayoutCycleMutation();

  const handleRunClearance = async () => {
    try {
      const res = await triggerClearanceMutation.mutateAsync();
      toast.success(
        res.message ||
          `Cleared ${res.clearedCount} transactions ($${res.totalAmountCleared})`,
      );
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to execute clearance engine.");
    }
  };

  const handleProcessPayouts = async () => {
    try {
      const res = await triggerPayoutCycleMutation.mutateAsync();
      toast.success(
        `Successfully disbursed payouts for ${res.payoutsCount} sellers ($${res.totalDisbursed})`,
      );
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to disburse payouts.");
    }
  };

  const renderStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
            COMPLETED
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
            PROCESSING
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
            PENDING
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">
            FAILED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-emerald-400" />
            Payouts & Escrow Settlement
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Manage seller payout cycles, 14-day hold releases, and 10% platform commission accounting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchRevenue();
              refetchPayouts();
            }}
            className="border-[#22222C] bg-[#16161D] text-[#A2A3B0] hover:text-white"
          >
            <RotateCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleRunClearance}
            disabled={triggerClearanceMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {triggerClearanceMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Clock className="h-4 w-4 mr-1.5" />
            )}
            Run 14-Day Clearance
          </Button>

          <Button
            size="sm"
            onClick={handleProcessPayouts}
            disabled={triggerPayoutCycleMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            {triggerPayoutCycleMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <DollarSign className="h-4 w-4 mr-1.5" />
            )}
            Disburse Payouts
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* GMV */}
        <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#7D7E8B]">
            <span className="text-xs font-medium">Marketplace GMV</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          {revenueLoading ? (
            <Skeleton className="h-7 w-24 bg-[#181820]" />
          ) : (
            <div className="text-xl font-bold font-mono text-white">
              ${Number(revenueData?.gmv || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-[10px] text-[#6F707E]">Gross customer payments</p>
        </div>

        {/* Platform Fees (10%) */}
        <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#7D7E8B]">
            <span className="text-xs font-medium">Platform Fees ({revenueData?.commissionRatePercent ?? 10}%)</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          {revenueLoading ? (
            <Skeleton className="h-7 w-24 bg-[#181820]" />
          ) : (
            <div className="text-xl font-bold font-mono text-emerald-400">
              ${Number(revenueData?.totalPlatformFees || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-[10px] text-emerald-500/80">Marketplace revenue earned</p>
        </div>

        {/* Pending Escrow */}
        <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#7D7E8B]">
            <span className="text-xs font-medium">Pending 14-Day Escrow</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          {revenueLoading ? (
            <Skeleton className="h-7 w-24 bg-[#181820]" />
          ) : (
            <div className="text-xl font-bold font-mono text-amber-400">
              ${Number(revenueData?.totalPendingEscrow || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-[10px] text-[#6F707E]">Hold period in progress</p>
        </div>

        {/* Available for Payout */}
        <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#7D7E8B]">
            <span className="text-xs font-medium">Cleared for Payout</span>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </div>
          {revenueLoading ? (
            <Skeleton className="h-7 w-24 bg-[#181820]" />
          ) : (
            <div className="text-xl font-bold font-mono text-purple-400">
              ${Number(revenueData?.totalAvailableForPayout || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-[10px] text-[#6F707E]">Cleared balances ready</p>
        </div>

        {/* Total Disbursed */}
        <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#7D7E8B]">
            <span className="text-xs font-medium">Disbursed to Date</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          {revenueLoading ? (
            <Skeleton className="h-7 w-24 bg-[#181820]" />
          ) : (
            <div className="text-xl font-bold font-mono text-white">
              ${Number(revenueData?.totalDisbursedPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-[10px] text-[#6F707E]">Sent to vendor accounts</p>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E1E26] pb-4">
          <h3 className="text-sm font-semibold text-white">Marketplace Disbursements Log</h3>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger className="w-36 h-8 text-xs bg-[#16161D] border-[#22222C] text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#16161D] border-[#22222C] text-white">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {payoutsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-[#181820]" />
            ))}
          </div>
        ) : !payoutsData?.items || payoutsData.items.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Wallet className="h-10 w-10 text-[#6F707E] mx-auto opacity-40" />
            <p className="text-sm font-medium text-white">No Payout Records Found</p>
            <p className="text-xs text-[#7D7E8B]">
              Once customer payments clear the 14-day hold, scheduled payout disbursements will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs">Payout #</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Store ID</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Amount</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Method</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Status</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Processed At</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutsData.items.map((item) => (
                  <TableRow key={item.id} className="border-[#1E1E26] hover:bg-[#181820]/40">
                    <TableCell className="font-mono text-xs text-white font-medium">
                      {item.payoutNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#A2A3B0]">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#6F707E]" />
                        {item.storeId.substring(0, 13)}...
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-emerald-400">
                      {item.currency} {Number(item.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-[#A2A3B0]">
                      <Badge variant="outline" className="border-[#22222C] bg-[#16161D] text-[10px]">
                        {item.payoutMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs text-[#7D7E8B]">
                      {item.processedAt ? formatDate(item.processedAt) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-[#7D7E8B]">
                      {formatDate(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {payoutsData.meta && payoutsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#1E1E26] text-xs text-[#7D7E8B]">
                <span>
                  Page {payoutsData.meta.page} of {payoutsData.meta.totalPages} ({payoutsData.meta.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-xs border-[#22222C] bg-[#16161D] text-white"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= payoutsData.meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs border-[#22222C] bg-[#16161D] text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
