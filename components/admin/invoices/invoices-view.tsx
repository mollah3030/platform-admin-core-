"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  ExternalLink,
  Printer,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInvoices } from "@/hooks/queries/use-invoices";
import { invoicesApi } from "@/resources/apis/invoices.api";
import type { Invoice, InvoiceStatus } from "@/resources/interfaces/invoice.interface";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function InvoicesView() {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const {
    data: invoicesData,
    isLoading,
    refetch,
  } = useInvoices({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter === "ALL" ? undefined : (statusFilter as InvoiceStatus),
  });

  const handleOpenInvoicePreview = async (invoice: Invoice) => {
    try {
      setPreviewLoading(true);
      setPreviewTitle(`Invoice ${invoice.invoiceNumber}`);
      setIsDialogOpen(true);

      const html = await invoicesApi.getInvoiceHtml(invoice.id);
      setPreviewHtml(html);
    } catch (err: unknown) {
      toast.error("Failed to load printable invoice preview.");
      setIsDialogOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrintNewTab = async (invoice: Invoice) => {
    try {
      const html = await invoicesApi.getInvoiceHtml(invoice.id);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
      }
    } catch {
      toast.error("Failed to open print window.");
    }
  };

  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
            PAID
          </Badge>
        );
      case "ISSUED":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
            ISSUED
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs">
            CANCELLED
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">
            REFUNDED
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
            <Receipt className="h-7 w-7 text-blue-400" />
            Marketplace Invoices
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Official, tax-compliant invoices generated for all marketplace orders with item breakdowns.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-[#22222C] bg-[#16161D] text-[#A2A3B0] hover:text-white"
        >
          <RotateCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filter and Table Card */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E1E26] pb-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6F707E]" />
              <Input
                placeholder="Search invoice # or customer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-8 h-8 text-xs bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 h-8 text-xs bg-[#16161D] border-[#22222C] text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#16161D] border-[#22222C] text-white">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="ISSUED">Issued</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-[#181820]" />
            ))}
          </div>
        ) : !invoicesData?.items || invoicesData.items.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Receipt className="h-10 w-10 text-[#6F707E] mx-auto opacity-40" />
            <p className="text-sm font-medium text-white">No Invoices Found</p>
            <p className="text-xs text-[#7D7E8B]">
              Invoices are automatically generated upon successful order payment via Stripe.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs">Invoice #</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Customer</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Order ID</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Total Amount</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Status</TableHead>
                  <TableHead className="text-[#6F707E] text-xs">Issued Date</TableHead>
                  <TableHead className="text-[#6F707E] text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesData.items.map((inv) => (
                  <TableRow key={inv.id} className="border-[#1E1E26] hover:bg-[#181820]/40">
                    <TableCell className="font-mono text-xs text-blue-400 font-semibold">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        <span className="font-medium text-white block">{inv.customerName}</span>
                        <span className="text-[11px] text-[#7D7E8B] font-mono">{inv.customerEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#A2A3B0]">
                      {inv.order?.orderNumber || inv.orderId.substring(0, 8) + "..."}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-white">
                      {inv.currency} {Number(inv.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>{renderStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-xs text-[#7D7E8B]">
                      {formatDate(inv.issuedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenInvoicePreview(inv)}
                          className="h-7 px-2 text-xs text-[#A2A3B0] hover:text-white"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintNewTab(inv)}
                          className="h-7 px-2 text-xs text-[#A2A3B0] hover:text-white"
                        >
                          <Printer className="h-3.5 w-3.5 mr-1" />
                          Print
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {invoicesData.meta && invoicesData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#1E1E26] text-xs text-[#7D7E8B]">
                <span>
                  Page {invoicesData.meta.page} of {invoicesData.meta.totalPages} ({invoicesData.meta.total} total)
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
                    disabled={page >= invoicesData.meta.totalPages}
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

      {/* Invoice HTML Preview Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#121217] border-[#1E1E26] text-white p-6 overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-[#1E1E26] pb-3">
            <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-400" />
              {previewTitle}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (previewHtml) {
                    const win = window.open("", "_blank");
                    if (win) {
                      win.document.write(previewHtml);
                      win.document.close();
                      win.focus();
                      setTimeout(() => win.print(), 500);
                    }
                  }
                }}
                className="h-7 text-xs border-[#22222C] bg-[#16161D] text-white"
              >
                <Printer className="h-3.5 w-3.5 mr-1" />
                Print / Download PDF
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-2">
            {previewLoading ? (
              <div className="space-y-3 p-6">
                <Skeleton className="h-8 w-1/3 bg-[#181820]" />
                <Skeleton className="h-32 w-full bg-[#181820]" />
                <Skeleton className="h-40 w-full bg-[#181820]" />
              </div>
            ) : previewHtml ? (
              <div className="bg-white rounded-lg p-2 overflow-auto">
                <iframe
                  title="Invoice Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[650px] border-0"
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
