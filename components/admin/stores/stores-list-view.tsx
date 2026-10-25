"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  Building2,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Eye,
  Pencil,
  Sparkles,
} from "lucide-react";

import { EditStoreDialog } from "./edit-store-dialog";
import { ChangeStoreStatusDialog } from "./change-store-status-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStores } from "@/hooks/queries/use-stores";
import { storesApi } from "@/resources/apis/stores.api";
import type { Store as StoreType, StoreStatus } from "@/resources/interfaces/store.interface";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";

export function StoresListView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Suspension state
  const [storeToSuspend, setStoreToSuspend] = useState<StoreType | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // Rejection state
  const [storeToReject, setStoreToReject] = useState<StoreType | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Edit & Status Change state
  const [storeToEdit, setStoreToEdit] = useState<StoreType | null>(null);
  const [storeToChangeStatus, setStoreToChangeStatus] = useState<StoreType | null>(null);

  const { data, isLoading, refetch } = useStores({
    page: 1,
    limit: 50,
    status: statusFilter !== "all" ? (statusFilter as StoreStatus) : undefined,
  });

  const stores = data?.data ?? [];
  const total = data?.total ?? 0;

  const getErrorMessage = (err: any, fallback: string) => {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(" · ");
    if (typeof msg === "string") return msg;
    return fallback;
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      await storesApi.approveStore(id);
      toast.success(`Store "${name}" approved successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to approve store."));
    }
  };

  const handleActivate = async (id: string, name: string) => {
    try {
      await storesApi.activateStore(id);
      toast.success(`Store "${name}" activated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to activate store."));
    }
  };

  const handleDirectActivate = async (id: string, name: string) => {
    try {
      await storesApi.updateStoreStatus(id, "ACTIVE");
      toast.success(`Store "${name}" directly activated. Store admin can now log in and add products!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to directly activate store."));
    }
  };

  const handleConfirmSuspend = async () => {
    if (!storeToSuspend) return;
    if (!suspendReason.trim() || suspendReason.trim().length < 5) {
      toast.error("Suspension reason must be at least 5 characters.");
      return;
    }

    try {
      setIsSuspending(true);
      await storesApi.suspendStore(storeToSuspend.id, suspendReason.trim());
      toast.success(`Store "${storeToSuspend.name}" suspended successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      setStoreToSuspend(null);
      setSuspendReason("");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to suspend store."));
    } finally {
      setIsSuspending(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!storeToReject) return;
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error("Rejection reason must be at least 5 characters.");
      return;
    }

    try {
      setIsRejecting(true);
      await storesApi.rejectStore(storeToReject.id, rejectReason.trim());
      toast.success(`Store application "${storeToReject.name}" rejected.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      setStoreToReject(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to reject store."));
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredStores = stores.filter(
    (s: StoreType) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.legalBusinessName?.toLowerCase().includes(search.toLowerCase()) ||
      s.businessId?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Stores &amp; Tenant Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Review vendor onboarding applications, approve stores, and manage tenant operations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="h-9 rounded-xl bg-[#14141A] border-[#22222C] text-[#8E8F99] hover:text-white self-start sm:self-auto gap-1.5 text-xs"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6F707E]" />
          <Input
            type="search"
            placeholder="Search by store name, legal name, or business ID..."
            className="pl-9 text-xs h-9 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-[#16161D] border-[#22222C] text-[#E0E0E6]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-[#E0E0E6]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden w-full">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-[#181820] rounded-xl" />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
            <Store className="h-10 w-10 text-[#454652] mb-3" />
            <h3 className="text-base font-semibold text-white">No stores found</h3>
            <p className="text-xs text-[#7D7E8B] mt-1 max-w-sm">
              {search || statusFilter !== "all"
                ? "No stores matched your current search filters."
                : "No stores registered on the platform yet."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[700px]">
              <TableHeader>
                <TableRow className="border-b border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Store / Business</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Contact</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Currency / Timezone</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-right text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((s) => (
                  <TableRow
                    key={s.id}
                    onClick={() => router.push(`/admin/stores/${s.id}`)}
                    className="border-b border-[#1A1A22] hover:bg-[#16161D] cursor-pointer transition-colors"
                  >
                    <TableCell>
                      <NextLink
                        href={`/admin/stores/${s.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="group flex flex-col hover:underline cursor-pointer"
                      >
                        <span className="font-semibold text-sm text-white group-hover:text-rose-400 transition-colors">
                          {s.name}
                        </span>
                        <span className="text-xs text-[#8E8F99]">
                          {s.legalBusinessName}
                        </span>
                        <span className="text-[11px] text-[#6F707E] font-mono">
                          ID: {s.businessId} {s.vatId ? `· VAT: ${s.vatId}` : ""}
                        </span>
                      </NextLink>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          s.status === "ACTIVE"
                            ? "success"
                            : s.status === "APPROVED"
                            ? "outline"
                            : s.status === "UNDER_REVIEW" || s.status === "PENDING"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[11px] font-semibold"
                      >
                        {s.status === "UNDER_REVIEW" ? "Under Review" : s.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-[#8E8F99]">
                      <div className="space-y-0.5">
                        <div className="font-medium text-white">{s.contactName || "N/A"}</div>
                        <div className="text-[11px] text-[#6F707E]">{s.phone || "No phone"}</div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-[#8E8F99]">
                      <span className="font-mono text-white">{s.currency}</span> · {s.timezone}
                    </TableCell>

                    <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7D7E8B] hover:text-white hover:bg-white/[0.05]">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#14141A] border-[#22222C] text-[#E0E0E6]">
                          <DropdownMenuLabel className="text-xs text-[#7D7E8B]">
                            Store Operations
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#22222C]" />

                          <DropdownMenuItem asChild>
                            <NextLink
                              href={`/admin/stores/${s.id}`}
                              className="cursor-pointer hover:bg-white/5 flex items-center text-white"
                            >
                              <Eye className="mr-2 h-4 w-4 text-[#7D7E8B]" />
                              View KPIs &amp; Details
                            </NextLink>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => setStoreToEdit(s)}
                            className="cursor-pointer hover:bg-white/5 text-rose-300 flex items-center"
                          >
                            <Pencil className="mr-2 h-4 w-4 text-rose-400" />
                            Edit Store Details
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => setStoreToChangeStatus(s)}
                            className="cursor-pointer hover:bg-white/5 text-amber-300 flex items-center"
                          >
                            <Sparkles className="mr-2 h-4 w-4 text-amber-400" />
                            Change Lifecycle Status
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-[#22222C]" />

                          {/* Dynamic Lifecycle Quick Actions */}
                          {(s.status === "UNDER_REVIEW" || s.status === "PENDING") && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleDirectActivate(s.id, s.name)}
                                className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                              >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Direct Activate (Enable Login)
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleApprove(s.id, s.name)}
                                className="cursor-pointer text-blue-400 hover:bg-blue-500/10"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Store Application
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setStoreToReject(s);
                                  setRejectReason("Incomplete business documentation provided.");
                                }}
                                className="cursor-pointer text-rose-400 hover:bg-rose-500/10"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Application
                              </DropdownMenuItem>
                            </>
                          )}

                          {s.status === "APPROVED" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleActivate(s.id, s.name)}
                                className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate Store (Enable Login)
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setStoreToSuspend(s);
                                  setSuspendReason("Policy review required before activation.");
                                }}
                                className="cursor-pointer text-rose-400 hover:bg-rose-500/10"
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Suspend Store
                              </DropdownMenuItem>
                            </>
                          )}

                          {s.status === "SUSPENDED" && (
                            <DropdownMenuItem
                              onClick={() => handleActivate(s.id, s.name)}
                              className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Reactivate Store
                            </DropdownMenuItem>
                          )}

                          {s.status === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setStoreToSuspend(s);
                                setSuspendReason("Policy violation: Administrative compliance review under investigation.");
                              }}
                              className="cursor-pointer text-rose-400 hover:bg-rose-500/10"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Suspend Store
                            </DropdownMenuItem>
                          )}

                          {s.status === "REJECTED" && (
                            <DropdownMenuItem
                              onClick={() => handleDirectActivate(s.id, s.name)}
                              className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Reconsider &amp; Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Suspend Store Confirmation Dialog */}
      <Dialog
        open={Boolean(storeToSuspend)}
        onOpenChange={(open) => !open && setStoreToSuspend(null)}
      >
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Suspend Store Access
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Suspending <strong className="text-white">{storeToSuspend?.name}</strong> will
              immediately block store admin dashboard access and pause active operations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="suspendReason" className="text-xs text-[#A2A3B0]">
              Suspension Reason (Required, min 5 characters)
            </Label>
            <Textarea
              id="suspendReason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Explain the administrative or policy violation reason..."
              className="bg-[#16161D] border-[#22222C] text-white text-xs min-h-[90px] rounded-xl focus-visible:ring-rose-500/50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStoreToSuspend(null)}
              className="bg-[#1A1A24] border-[#2A2A36] text-white hover:bg-[#222230] text-xs h-9 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSuspend}
              disabled={isSuspending || suspendReason.trim().length < 5}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 rounded-xl font-semibold gap-1.5"
            >
              {isSuspending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Confirmation Dialog */}
      <Dialog
        open={Boolean(storeToReject)}
        onOpenChange={(open) => !open && setStoreToReject(null)}
      >
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <XCircle className="h-5 w-5" />
              Reject Store Application
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Reject the vendor onboarding application for{" "}
              <strong className="text-white">{storeToReject?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="rejectReason" className="text-xs text-[#A2A3B0]">
              Rejection Reason (Required, min 5 characters)
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State the reason why the application does not meet platform requirements..."
              className="bg-[#16161D] border-[#22222C] text-white text-xs min-h-[90px] rounded-xl focus-visible:ring-rose-500/50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStoreToReject(null)}
              className="bg-[#1A1A24] border-[#2A2A36] text-white hover:bg-[#222230] text-xs h-9 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReject}
              disabled={isRejecting || rejectReason.trim().length < 5}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 rounded-xl font-semibold gap-1.5"
            >
              {isRejecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Store Details Dialog */}
      <EditStoreDialog
        store={storeToEdit}
        open={Boolean(storeToEdit)}
        onOpenChange={(open) => !open && setStoreToEdit(null)}
      />

      {/* Change Store Status Dialog */}
      <ChangeStoreStatusDialog
        store={storeToChangeStatus}
        open={Boolean(storeToChangeStatus)}
        onOpenChange={(open) => !open && setStoreToChangeStatus(null)}
      />
    </div>
  );
}
