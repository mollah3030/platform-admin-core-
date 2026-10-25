"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import { storesApi } from "@/resources/apis/stores.api";
import type { Store, StoreStatus } from "@/resources/interfaces/store.interface";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";

interface ChangeStoreStatusDialogProps {
  store: Store | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STATUS_DESCRIPTIONS: Record<StoreStatus, { title: string; desc: string; color: string }> = {
  ACTIVE: {
    title: "Active (Fully Operational)",
    desc: "Store administrators can log in, publish products, manage inventory, and receive customer orders.",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  },
  APPROVED: {
    title: "Approved (Pending Activation)",
    desc: "Verification passed. Store is approved but requires final activation step before public listing.",
    color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  },
  UNDER_REVIEW: {
    title: "Under Review (Odottaa Hyväksyntää)",
    desc: "Store application submitted and waiting for admin curator identity / Y-tunnus verification.",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  },
  PENDING: {
    title: "Pending",
    desc: "Initial onboarding stage awaiting review queue placement.",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  },
  SUSPENDED: {
    title: "Suspended (Access Revoked)",
    desc: "Store admin portal locked. Listings hidden from buyer storefront due to investigation or violation.",
    color: "text-rose-400 border-rose-500/20 bg-rose-500/10",
  },
  REJECTED: {
    title: "Rejected (Declined)",
    desc: "Store application denied. Cannot access platform tools.",
    color: "text-zinc-400 border-zinc-500/20 bg-zinc-500/10",
  },
};

export function ChangeStoreStatusDialog({
  store,
  open,
  onOpenChange,
  onSuccess,
}: ChangeStoreStatusDialogProps) {
  const queryClient = useQueryClient();
  const [targetStatus, setTargetStatus] = useState<StoreStatus>("ACTIVE");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setTargetStatus(store.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE");
      setReason("");
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    if (
      (targetStatus === "SUSPENDED" || targetStatus === "REJECTED") &&
      (!reason.trim() || reason.trim().length < 5)
    ) {
      toast.error(`Please provide a reason of at least 5 characters for setting status to ${targetStatus}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await storesApi.updateStoreStatus(store.id, targetStatus, reason.trim() || undefined);

      toast.success(`Store "${store.name}" status changed to ${targetStatus}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(store.id) });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg.join(" · ") : typeof msg === "string" ? msg : "Failed to change status";
      toast.error(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#14141A] border-[#22222C] text-[#E0E0E6]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Change Lifecycle Status
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8E8F99]">
                Updating status for <strong className="text-white">{store.name}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Current Status Pill */}
          <div className="p-3 bg-[#121217] border border-[#1E1E26] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#8E8F99]">Current Status:</span>
            <Badge
              variant={
                store.status === "ACTIVE"
                  ? "success"
                  : store.status === "SUSPENDED" || store.status === "REJECTED"
                  ? "destructive"
                  : "warning"
              }
              className="text-[11px] font-semibold"
            >
              {store.status}
            </Badge>
          </div>

          {/* Target Status Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[#A0A1AD]">Target Status *</Label>
            <Select
              value={targetStatus}
              onValueChange={(val) => setTargetStatus(val as StoreStatus)}
            >
              <SelectTrigger className="bg-[#181820] border-[#262633] text-white text-xs h-10">
                <SelectValue placeholder="Select target status" />
              </SelectTrigger>
              <SelectContent className="bg-[#181820] border-[#262633] text-white text-xs">
                <SelectItem value="ACTIVE">
                  <span className="text-emerald-400 font-bold">ACTIVE</span> (Immediate Store Login &amp; Sell)
                </SelectItem>
                <SelectItem value="APPROVED">
                  <span className="text-blue-400 font-bold">APPROVED</span> (Application Approved)
                </SelectItem>
                <SelectItem value="UNDER_REVIEW">
                  <span className="text-amber-400 font-bold">UNDER_REVIEW</span> (Pending Verification)
                </SelectItem>
                <SelectItem value="PENDING">
                  <span className="text-amber-400 font-bold">PENDING</span> (Pending Review)
                </SelectItem>
                <SelectItem value="SUSPENDED">
                  <span className="text-rose-400 font-bold">SUSPENDED</span> (Account Suspended)
                </SelectItem>
                <SelectItem value="REJECTED">
                  <span className="text-zinc-400 font-bold">REJECTED</span> (Application Declined)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description of target status */}
          {targetStatus && (
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${STATUS_DESCRIPTIONS[targetStatus].color}`}>
              <div className="font-semibold">{STATUS_DESCRIPTIONS[targetStatus].title}</div>
              <div className="text-[11px] mt-1 opacity-90">{STATUS_DESCRIPTIONS[targetStatus].desc}</div>
            </div>
          )}

          {/* Reason (required for suspended / rejected) */}
          {(targetStatus === "SUSPENDED" || targetStatus === "REJECTED") && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <Label className="text-xs text-rose-400 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Reason for {targetStatus} *
              </Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Provide the administrative reason for marking this store as ${targetStatus}...`}
                rows={3}
                className="bg-[#181820] border-[#262633] text-white text-xs"
                required
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#22222C]">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="bg-[#181820] border-[#262633] text-[#A0A1AD] hover:text-white text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating Status...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Apply Status Change
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
