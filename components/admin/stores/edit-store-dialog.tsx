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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Store as StoreIcon, ShieldCheck } from "lucide-react";
import { storesApi } from "@/resources/apis/stores.api";
import type { Store, StoreStatus, UpdateStorePayload } from "@/resources/interfaces/store.interface";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";

interface EditStoreDialogProps {
  store: Store | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditStoreDialog({
  store,
  open,
  onOpenChange,
  onSuccess,
}: EditStoreDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<UpdateStorePayload>({
    name: "",
    legalBusinessName: "",
    businessId: "",
    vatId: "",
    contactName: "",
    phone: "",
    address: "",
    status: "UNDER_REVIEW",
    currency: "EUR",
    timezone: "Europe/Helsinki",
    description: "",
    websiteUrl: "",
    logoUrl: "",
    autoSubmitProducts: false,
    defaultLowStockThreshold: 5,
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        legalBusinessName: store.legalBusinessName || "",
        businessId: store.businessId || "",
        vatId: store.vatId || "",
        contactName: store.contactName || "",
        phone: store.phone || "",
        address: store.address || "",
        status: store.status || "UNDER_REVIEW",
        currency: store.currency || "EUR",
        timezone: store.timezone || "Europe/Helsinki",
        description: store.description || "",
        websiteUrl: store.websiteUrl || "",
        logoUrl: store.logoUrl || "",
        autoSubmitProducts: Boolean(store.autoSubmitProducts),
        defaultLowStockThreshold: store.defaultLowStockThreshold ?? 5,
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    if (!formData.name?.trim()) {
      toast.error("Store name is required");
      return;
    }
    if (!formData.businessId?.trim()) {
      toast.error("Business ID / Y-tunnus is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await storesApi.updateStore(store.id, {
        name: formData.name.trim(),
        legalBusinessName: formData.legalBusinessName?.trim() || undefined,
        businessId: formData.businessId.trim(),
        vatId: formData.vatId?.trim() || null,
        contactName: formData.contactName?.trim() || null,
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        status: formData.status,
        currency: formData.currency?.trim() || "EUR",
        timezone: formData.timezone?.trim() || "Europe/Helsinki",
        description: formData.description?.trim() || null,
        websiteUrl: formData.websiteUrl?.trim() || null,
        logoUrl: formData.logoUrl?.trim() || null,
        autoSubmitProducts: formData.autoSubmitProducts,
        defaultLowStockThreshold: Number(formData.defaultLowStockThreshold) || 5,
      });

      toast.success(`Store "${formData.name}" updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(store.id) });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg.join(" · ") : typeof msg === "string" ? msg : "Failed to update store";
      toast.error(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#14141A] border-[#22222C] text-[#E0E0E6]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <StoreIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Edit Store &amp; Seller Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8E8F99]">
                Super Admin override: update store identity, legal business details, contact, and lifecycle status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Section 1: Core Store & Status */}
          <div className="rounded-xl border border-[#1E1E26] bg-[#121217] p-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Store Identity &amp; Platform Status
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#A0A1AD]">Public Store Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Fiskars Ceramic Studio"
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#A0A1AD]">Lifecycle Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val as StoreStatus })}
                >
                  <SelectTrigger className="bg-[#181820] border-[#262633] text-white text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#181820] border-[#262633] text-white text-xs">
                    <SelectItem value="ACTIVE">
                      <span className="text-emerald-400 font-semibold">ACTIVE</span> — Full store dashboard &amp; selling access
                    </SelectItem>
                    <SelectItem value="APPROVED">
                      <span className="text-blue-400 font-semibold">APPROVED</span> — Approved, pending activation
                    </SelectItem>
                    <SelectItem value="UNDER_REVIEW">
                      <span className="text-amber-400 font-semibold">UNDER_REVIEW</span> — Application in verification
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <span className="text-amber-400 font-semibold">PENDING</span> — Pending initial review
                    </SelectItem>
                    <SelectItem value="SUSPENDED">
                      <span className="text-rose-400 font-semibold">SUSPENDED</span> — Blocked due to compliance
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <span className="text-zinc-400 font-semibold">REJECTED</span> — Application denied
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-[#7D7E8B]">
                  Setting status to <strong>ACTIVE</strong> allows the store to log in immediately and manage products.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Legal Entity & Compliance */}
          <div className="rounded-xl border border-[#1E1E26] bg-[#121217] p-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A0A1AD]">
              Legal Entity &amp; Finnish Taxation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-xs text-[#A0A1AD]">Legal Business Name</Label>
                <Input
                  value={formData.legalBusinessName || ""}
                  onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
                  placeholder="e.g. Fiskars Oy / T:mi Matti"
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-xs text-[#A0A1AD]">Business ID (Y-tunnus) *</Label>
                <Input
                  value={formData.businessId}
                  onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                  placeholder="1234567-8"
                  className="bg-[#181820] border-[#262633] text-white text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-xs text-[#A0A1AD]">VAT / ALV Identifier</Label>
                <Input
                  value={formData.vatId || ""}
                  onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                  placeholder="FI12345678"
                  className="bg-[#181820] border-[#262633] text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Location */}
          <div className="rounded-xl border border-[#1E1E26] bg-[#121217] p-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A0A1AD]">
              Primary Contact &amp; Workshop Location
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#A0A1AD]">Primary Contact Name</Label>
                <Input
                  value={formData.contactName || ""}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Artisan / Manager Name"
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#A0A1AD]">Phone Number</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+358 40 123 4567"
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs text-[#A0A1AD]">Workshop / Physical Address</Label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, Postal Code, City, Finland"
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Operational Settings & Profile */}
          <div className="rounded-xl border border-[#1E1E26] bg-[#121217] p-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A0A1AD]">
              Settings &amp; Public Bio
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#A0A1AD]">Currency</Label>
                <Input
                  value={formData.currency || "EUR"}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="EUR"
                  className="bg-[#181820] border-[#262633] text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#A0A1AD]">Timezone</Label>
                <Input
                  value={formData.timezone || "Europe/Helsinki"}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="Europe/Helsinki"
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#A0A1AD]">Low Stock Alert Threshold</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.defaultLowStockThreshold ?? 5}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultLowStockThreshold: Number(e.target.value) })
                  }
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label className="text-xs text-[#A0A1AD]">Website URL</Label>
                <Input
                  value={formData.websiteUrl || ""}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://studio-website.fi"
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label className="text-xs text-[#A0A1AD]">Store Description / Story</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the artisan crafts and workshop heritage..."
                  rows={3}
                  className="bg-[#181820] border-[#262633] text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-between md:col-span-3 pt-2 border-t border-[#1E1E26]">
                <div>
                  <Label className="text-xs text-white">Auto-Submit Products</Label>
                  <p className="text-[11px] text-[#7D7E8B]">
                    When enabled, newly created products are automatically submitted for marketplace approval.
                  </p>
                </div>
                <Switch
                  checked={Boolean(formData.autoSubmitProducts)}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoSubmitProducts: checked })
                  }
                />
              </div>
            </div>
          </div>

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
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Store Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
