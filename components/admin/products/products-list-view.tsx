"use client";

import React, { useState } from "react";
import {
  Package,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Globe,
  RotateCw,
  Tag,
  DollarSign,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/queries/use-products";
import { useCategories } from "@/hooks/queries/use-categories";
import { productsApi } from "@/resources/apis/products.api";
import type { Product, ProductStatus } from "@/resources/interfaces/product.interface";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";

export function ProductsListView() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useProducts({
    page: 1,
    limit: 50,
    status: statusFilter !== "all" ? (statusFilter as ProductStatus) : undefined,
  });

  const { data: categories = [] } = useCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleApprove = async (id: string, name: string) => {
    try {
      await productsApi.approveProduct(id);
      toast.success(`Product "${name}" approved.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve product.");
    }
  };

  const handlePublish = async (id: string, name: string) => {
    try {
      await productsApi.publishProduct(id);
      toast.success(`Product "${name}" published to marketplace.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish product.");
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await productsApi.rejectProduct(id, "Does not meet marketplace standards");
      toast.success(`Product "${name}" rejected.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject product.");
    }
  };

  const filteredProducts = products.filter(
    (p: Product) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.store?.name.toLowerCase().includes(search.toLowerCase()),
  );


  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Marketplace Catalog Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Review, approve, and publish products submitted by platform vendors.
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
            placeholder="Search by product name, SKU, or vendor store..."
            className="pl-9 text-xs h-9 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl bg-[#16161D] border-[#22222C] text-[#E0E0E6]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-[#E0E0E6]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden w-full">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-[#181820] rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
            <Package className="h-10 w-10 text-[#454652] mb-3" />
            <h3 className="text-base font-semibold text-white">No products found</h3>
            <p className="text-xs text-[#7D7E8B] mt-1 max-w-sm">
              {search || statusFilter !== "all"
                ? "No products matched your search criteria."
                : "No products submitted by stores yet."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[700px]">
              <TableHeader>
                <TableRow className="border-b border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Product</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Store Vendor</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Price / VAT</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-right text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id} className="border-b border-[#1A1A22] hover:bg-[#16161D]/60 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-white">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[11px] text-[#6F707E] font-mono">
                            SKU: {p.sku} · {p.variants?.length || 0} variant(s)
                          </span>
                          {p.categoryId && categoryMap.get(p.categoryId) && (
                            <Badge variant="outline" className="text-[10px] bg-rose-500/10 border-rose-500/25 text-rose-300 py-0 h-4">
                              {categoryMap.get(p.categoryId)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          p.status === "PUBLISHED"
                            ? "success"
                            : p.status === "DRAFT"
                            ? "secondary"
                            : p.status === "REJECTED"
                            ? "destructive"
                            : "default"
                        }
                        className="text-[11px]"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-[#8E8F99]">
                      <span className="font-medium text-white">{p.store?.name || "Global"}</span>
                    </TableCell>

                    <TableCell className="text-xs text-[#8E8F99]">
                      <span className="font-mono text-rose-400 font-semibold text-sm">${p.price}</span>
                      <span className="text-[11px] text-[#6F707E] block">VAT {p.vatRate}%</span>
                    </TableCell>

                    <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7D7E8B] hover:text-white hover:bg-white/[0.05]">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#14141A] border-[#22222C] text-[#E0E0E6]">
                          <DropdownMenuLabel className="text-xs text-[#7D7E8B]">
                            Moderation Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#22222C]" />

                          {p.status !== "APPROVED" && p.status !== "PUBLISHED" && (
                            <DropdownMenuItem
                              onClick={() => handleApprove(p.id, p.name)}
                              className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Product
                            </DropdownMenuItem>
                          )}

                          {p.status !== "PUBLISHED" && (
                            <DropdownMenuItem
                              onClick={() => handlePublish(p.id, p.name)}
                              className="cursor-pointer text-blue-400 hover:bg-blue-500/10"
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              Publish to Marketplace
                            </DropdownMenuItem>
                          )}

                          {p.status !== "REJECTED" && (
                            <DropdownMenuItem
                              onClick={() => handleReject(p.id, p.name)}
                              className="cursor-pointer text-rose-400 hover:bg-rose-500/10"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Product
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
    </div>
  );
}
