"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Store as StoreIcon,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  Package,
  ShoppingCart,
  Users,
  Shield,
  CreditCard,
  Clock,
  DollarSign,
  UserPlus,
  Trash2,
  ExternalLink,
  Loader2,
  Pencil,
  Sparkles,
  Globe,
} from "lucide-react";
import { EditStoreDialog } from "./edit-store-dialog";
import { ChangeStoreStatusDialog } from "./change-store-status-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useStore } from "@/hooks/queries/use-stores";
import { useProducts } from "@/hooks/queries/use-products";
import { useOrders } from "@/hooks/queries/use-orders";
import { useUsers } from "@/hooks/queries/use-users";
import { storesApi } from "@/resources/apis/stores.api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import type { Product } from "@/resources/interfaces/product.interface";

export function StoreDetailsView({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { data: store, isLoading, refetch } = useStore(id);
  const { data: productsData, isLoading: productsLoading } = useProducts({ page: 1, limit: 100 });
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ storeId: id });
  const { data: platformUsersData } = useUsers({ page: 1, limit: 100 });

  // Dialog states
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [assignAdminOpen, setAssignAdminOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Edit & Status Change state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const getErrorMessage = (err: any, fallback: string) => {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(" · ");
    if (typeof msg === "string") return msg;
    return fallback;
  };

  const handleApprove = async () => {
    if (!store) return;
    try {
      await storesApi.approveStore(store.id);
      toast.success(`Store "${store.name}" approved.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(store.id) });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to approve store."));
    }
  };

  const handleActivate = async () => {
    if (!store) return;
    try {
      await storesApi.activateStore(store.id);
      toast.success(`Store "${store.name}" activated.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(store.id) });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to activate store."));
    }
  };

  const handleDirectActivate = async () => {
    if (!store) return;
    try {
      await storesApi.updateStoreStatus(store.id, "ACTIVE");
      toast.success(`Store "${store.name}" activated! Store admin can now log in and add products.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(store.id) });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to activate store."));
    }
  };

  const handleConfirmSuspend = async () => {
    if (!store) return;
    if (!suspendReason.trim() || suspendReason.trim().length < 5) {
      toast.error("Suspension reason must be at least 5 characters.");
      return;
    }

    try {
      setIsSuspending(true);
      await storesApi.suspendStore(store.id, suspendReason.trim());
      toast.success(`Store "${store.name}" suspended successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      setSuspendOpen(false);
      setSuspendReason("");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to suspend store."));
    } finally {
      setIsSuspending(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!store) return;
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error("Rejection reason must be at least 5 characters.");
      return;
    }

    try {
      setIsRejecting(true);
      await storesApi.rejectStore(store.id, rejectReason.trim());
      toast.success(`Store application "${store.name}" rejected.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      setRejectOpen(false);
      setRejectReason("");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to reject store."));
    } finally {
      setIsRejecting(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!store || !selectedUserId) return;
    try {
      setIsAssigning(true);
      await storesApi.addStoreAdmin(store.id, selectedUserId);
      toast.success("Store admin assigned successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(store.id) });
      setAssignAdminOpen(false);
      setSelectedUserId("");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to assign store admin."));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAdmin = async (adminRelationId: string) => {
    if (!store) return;
    try {
      await storesApi.removeStoreAdmin(store.id, adminRelationId);
      toast.success("Store administrator removed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(store.id) });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to remove store admin."));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-full">
        <Skeleton className="h-10 w-48 bg-[#181820]" />
        <Skeleton className="h-44 w-full bg-[#181820] rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-[#181820] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center bg-[#121217] rounded-2xl border border-[#1E1E26]">
        <StoreIcon className="h-12 w-12 text-[#454652] mb-3" />
        <h2 className="text-lg font-bold text-white">Store Not Found</h2>
        <p className="text-xs text-[#7D7E8B] mt-1">
          The requested store could not be located or has been removed.
        </p>
        <Button asChild variant="outline" className="mt-4 bg-[#16161D] border-[#22222C] text-xs">
          <NextLink href="/admin/stores">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stores
          </NextLink>
        </Button>
      </div>
    );
  }

  // Filter products belonging to this store
  const storeProducts = (productsData?.data ?? []).filter((p: Product) => p.storeId === store.id);
  const totalCatalogValue = storeProducts.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
  const storeOrders = ordersData?.data ?? [];
  const totalOrdersAmount = storeOrders.reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);
  const storeAdmins = store.storeAdmins ?? [];

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl bg-[#14141A] border-[#22222C] text-[#8E8F99] hover:text-white"
          >
            <NextLink href="/admin/stores">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Stores</span>
            </NextLink>
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {store.name}
              </h1>
              <Badge
                variant={
                  store.status === "ACTIVE"
                    ? "success"
                    : store.status === "APPROVED"
                    ? "outline"
                    : store.status === "UNDER_REVIEW" || store.status === "PENDING"
                    ? "warning"
                    : "destructive"
                }
                className="text-xs font-semibold"
              >
                {store.status === "UNDER_REVIEW" ? "Under Review" : store.status}
              </Badge>
            </div>
            <p className="text-xs text-[#7D7E8B] mt-0.5">
              {store.legalBusinessName} · Business ID: <span className="font-mono text-white">{store.businessId}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 rounded-xl bg-[#14141A] border-[#22222C] text-[#8E8F99] hover:text-white gap-1.5 text-xs"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Edit Store Dialog Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="h-9 rounded-xl bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Store Details
          </Button>

          {/* Change Status Dialog Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusDialogOpen(true)}
            className="h-9 rounded-xl bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Change Status
          </Button>

          {/* Dynamic Status Quick Actions */}
          {(store.status === "UNDER_REVIEW" || store.status === "PENDING") && (
            <>
              <Button
                size="sm"
                onClick={handleDirectActivate}
                className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Direct Activate (Enable Login)
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                className="h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold gap-1.5"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve Application
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRejectOpen(true)}
                className="h-9 rounded-xl text-xs font-semibold gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          )}

          {store.status === "APPROVED" && (
            <>
              <Button
                size="sm"
                onClick={handleActivate}
                className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Activate Store (Enable Login)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuspendOpen(true)}
                className="h-9 rounded-xl bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Suspend Store
              </Button>
            </>
          )}

          {store.status === "SUSPENDED" && (
            <Button
              size="sm"
              onClick={handleActivate}
              className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Reactivate Store
            </Button>
          )}

          {store.status === "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSuspendOpen(true)}
              className="h-9 rounded-xl bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Suspend Store
            </Button>
          )}

          {store.status === "REJECTED" && (
            <Button
              size="sm"
              onClick={handleDirectActivate}
              className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Reconsider &amp; Activate
            </Button>
          )}
        </div>
      </div>

      {/* Top KPIs Cards Row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Catalog Products */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              CATALOG PRODUCTS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              {storeProducts.length}
            </div>
            <p className="mt-1 text-[11px] text-[#6F707E]">
              Catalog value: <span className="font-mono text-white font-semibold">${totalCatalogValue.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Total Store Orders */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              STORE ORDERS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              {storeOrders.length}
            </div>
            <p className="mt-1 text-[11px] text-[#6F707E]">
              Revenue: <span className="font-mono text-emerald-400 font-semibold">${totalOrdersAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Store Administrators */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              STORE ADMINS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              {storeAdmins.length}
            </div>
            <p className="mt-1 text-[11px] text-[#6F707E]">
              Assigned vendor staff accounts
            </p>
          </div>
        </div>

        {/* KPI 4: Compliance & Settings */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              COMPLIANCE
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>{store.sellerAgreementAccepted ? "Agreement Accepted" : "Agreement Pending"}</span>
            </div>
            <p className="mt-1 text-[11px] text-[#6F707E] font-mono">
              {store.currency} · {store.timezone}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabbed Details Section */}
      <Tabs defaultValue="overview" className="w-full space-y-4">
        <TabsList className="bg-[#14141A] border border-[#22222C] p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger
            value="overview"
            className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
          >
            Overview &amp; Legal
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
          >
            Catalog Products ({storeProducts.length})
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
          >
            Store Administrators ({storeAdmins.length})
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
          >
            Orders &amp; Sales ({storeOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Legal Details */}
        <TabsContent value="overview" className="space-y-6">
          {/* Status Alert Banners */}
          {store.status === "SUSPENDED" && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-200">Store Suspended By Platform Administrator</div>
                <div className="text-[11px] mt-0.5 text-rose-300/90 leading-relaxed">
                  Reason: {store.suspensionReason || "Administrative compliance review under investigation."}
                </div>
              </div>
            </div>
          )}

          {store.status === "REJECTED" && (
            <div className="p-4 rounded-xl border border-zinc-500/30 bg-zinc-500/10 text-zinc-300 text-xs flex items-start gap-3">
              <XCircle className="h-5 w-5 shrink-0 text-zinc-400 mt-0.5" />
              <div>
                <div className="font-semibold text-zinc-200">Application Declined</div>
                <div className="text-[11px] mt-0.5 text-zinc-300/90 leading-relaxed">
                  Reason: {store.rejectionReason || "Application did not meet Finnish craft or documentation requirements."}
                </div>
              </div>
            </div>
          )}

          {store.status === "UNDER_REVIEW" && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <div className="font-semibold text-amber-200">Studio Onboarding Application Under Review</div>
                  <div className="text-[11px] mt-0.5 text-amber-300/90">
                    Verify Finnish Business ID (Y-tunnus) and activate the store so the artisan can log in and start selling.
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleDirectActivate}
                className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Activate Now
              </Button>
            </div>
          )}

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Legal Entity Card */}
            <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-rose-400" />
                  <h3 className="text-base font-semibold text-white">Business Entity Information</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                  className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 gap-1"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Display Store Name</span>
                  <span className="font-semibold text-white mt-0.5 block">{store.name}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Legal Business Name</span>
                  <span className="font-semibold text-white mt-0.5 block">{store.legalBusinessName}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Business Registry ID (Y-tunnus)</span>
                  <span className="font-mono text-white mt-0.5 block">{store.businessId}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">VAT Identification</span>
                  <span className="font-mono text-white mt-0.5 block">{store.vatId || "Not Registered"}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Primary Admin Email (Login)</span>
                  <span className="font-mono text-white mt-0.5 block flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    {store.storeAdmins?.[0]?.user?.email || "No admin linked"}
                  </span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Contact Person</span>
                  <span className="font-medium text-white mt-0.5 block">{store.contactName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Contact Phone</span>
                  <span className="font-mono text-white mt-0.5 block">{store.phone || "No phone recorded"}</span>
                </div>
                {store.websiteUrl && (
                  <div>
                    <span className="text-[#6F707E] block text-[11px]">Website</span>
                    <a
                      href={store.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      {store.websiteUrl}
                    </a>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-[#6F707E] block text-[11px]">Registered Address</span>
                  <span className="text-white mt-0.5 block">{store.address || "No address provided"}</span>
                </div>
                {store.description && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#1E1E26]">
                    <span className="text-[#6F707E] block text-[11px]">Artisan Story / Description</span>
                    <p className="text-[#D0D1DB] mt-1 leading-relaxed text-xs">{store.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Commerce Configuration Card */}
            <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Commerce &amp; System Configuration</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Store Currency</span>
                  <span className="font-mono text-white font-semibold mt-0.5 block">{store.currency}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Operating Timezone</span>
                  <span className="font-mono text-white mt-0.5 block">{store.timezone}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Low Stock Alert Threshold</span>
                  <span className="font-mono text-white mt-0.5 block">{store.defaultLowStockThreshold} units</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Auto-Submit Products</span>
                  <span className="font-medium text-white mt-0.5 block">
                    {store.autoSubmitProducts ? "Enabled" : "Disabled (Requires Manual Submit)"}
                  </span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Onboarded On</span>
                  <span className="text-white mt-0.5 block">{formatDate(store.createdAt)}</span>
                </div>
                <div>
                  <span className="text-[#6F707E] block text-[11px]">Last Updated</span>
                  <span className="text-white mt-0.5 block">{formatDate(store.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Catalog Products */}
        <TabsContent value="products">
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden w-full">
            <div className="p-4 border-b border-[#1E1E26] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Store Catalog Products</h3>
                <p className="text-xs text-[#6F707E]">
                  Products uploaded by this store to the marketplace catalog
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-[#16161D] border-[#22222C] text-[#8E8F99]">
                {storeProducts.length} Items
              </Badge>
            </div>

            {storeProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6F707E]">
                No products uploaded by this store yet.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[650px]">
                  <TableHeader>
                    <TableRow className="border-b border-[#1E1E26]">
                      <TableHead className="text-xs text-[#6F707E]">Product</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Status</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Price</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">VAT</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Variants</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeProducts.map((p: Product) => (
                      <TableRow key={p.id} className="border-b border-[#1A1A22] hover:bg-[#16161D]/60">
                        <TableCell>
                          <div className="font-medium text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-[#6F707E] font-mono">SKU: {p.sku}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === "PUBLISHED"
                                ? "success"
                                : p.status === "DRAFT"
                                ? "secondary"
                                : "default"
                            }
                            className="text-[10px]"
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-white text-xs font-semibold">
                          ${p.price}
                        </TableCell>
                        <TableCell className="text-xs text-[#8E8F99]">
                          {p.vatRate}% ({p.vatCode || "Std"})
                        </TableCell>
                        <TableCell className="text-xs text-[#8E8F99]">
                          {p.variants?.length || 0} variant(s)
                        </TableCell>
                        <TableCell className="text-xs text-[#7D7E8B]">
                          {formatDate(p.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Store Administrators */}
        <TabsContent value="admins">
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden w-full">
            <div className="p-4 border-b border-[#1E1E26] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Store Administrators</h3>
                <p className="text-xs text-[#6F707E]">
                  User accounts with operational management permissions for this store
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setAssignAdminOpen(true)}
                className="h-8 rounded-xl bg-[#E11D48] hover:bg-[#D01941] text-white text-xs font-semibold gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Store Admin</span>
              </Button>
            </div>

            {storeAdmins.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6F707E]">
                No administrators assigned to this store yet.
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A22]">
                {storeAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#16161D]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                        {admin.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{admin.user?.name || "Vendor Staff"}</div>
                        <div className="text-xs text-[#7D7E8B] font-mono">{admin.user?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-[#6E6F7C]">
                        Assigned {formatDate(admin.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Orders & Sales */}
        <TabsContent value="orders">
          <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden w-full">
            <div className="p-4 border-b border-[#1E1E26] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Orders for {store.name}</h3>
                <p className="text-xs text-[#6F707E]">
                  Customer orders fulfilled by this store
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-[#16161D] border-[#22222C] text-[#8E8F99]">
                {storeOrders.length} Orders
              </Badge>
            </div>

            {storeOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6F707E]">
                No customer orders placed for this store yet.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[650px]">
                  <TableHeader>
                    <TableRow className="border-b border-[#1E1E26]">
                      <TableHead className="text-xs text-[#6F707E]">Order #</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Status</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Customer</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Total</TableHead>
                      <TableHead className="text-xs text-[#6F707E]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeOrders.map((o) => (
                      <TableRow key={o.id} className="border-b border-[#1A1A22] hover:bg-[#16161D]/60">
                        <TableCell className="font-mono text-xs font-semibold text-white">
                          {o.orderNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-white">
                          {o.customerName || "Customer"}
                        </TableCell>
                        <TableCell className="font-mono text-emerald-400 font-semibold text-xs">
                          ${o.totalAmount}
                        </TableCell>
                        <TableCell className="text-xs text-[#7D7E8B]">
                          {formatDate(o.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Suspend Store Confirmation Dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Suspend Store Access
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Suspending <strong className="text-white">{store.name}</strong> will immediately block
              store admin dashboard access and pause all vendor operations.
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
              placeholder="State the administrative or compliance violation reason..."
              className="bg-[#16161D] border-[#22222C] text-white text-xs min-h-[90px] rounded-xl focus-visible:ring-rose-500/50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuspendOpen(false)}
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
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <XCircle className="h-5 w-5" />
              Reject Store Application
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Reject the store onboarding application for <strong className="text-white">{store.name}</strong>.
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
              placeholder="State why the application is being rejected..."
              className="bg-[#16161D] border-[#22222C] text-white text-xs min-h-[90px] rounded-xl focus-visible:ring-rose-500/50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
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

      {/* Assign Store Admin Dialog */}
      <Dialog open={assignAdminOpen} onOpenChange={setAssignAdminOpen}>
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <UserPlus className="h-5 w-5 text-rose-400" />
              Assign Store Administrator
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Select a user to grant store admin access for{" "}
              <strong className="text-white">{store.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs text-[#A2A3B0]">Select Platform User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="bg-[#16161D] border-[#22222C] text-white text-xs h-10 rounded-xl">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-white max-h-60">
                {(platformUsersData?.data ?? []).map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignAdminOpen(false)}
              className="bg-[#1A1A24] border-[#2A2A36] text-white hover:bg-[#222230] text-xs h-9 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignAdmin}
              disabled={isAssigning || !selectedUserId}
              className="bg-[#E11D48] hover:bg-[#D01941] text-white text-xs h-9 rounded-xl font-semibold gap-1.5"
            >
              {isAssigning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Assign Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Store Dialog */}
      <EditStoreDialog
        store={store}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Change Status Dialog */}
      <ChangeStoreStatusDialog
        store={store}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
