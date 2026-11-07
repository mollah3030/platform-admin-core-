"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Package,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  DollarSign,
  Layers,
  Sparkles,
  Calendar,
  Store,
  Percent,
  Loader2,
  FileText,
  Sliders,
  ShieldCheck,
  Tag,
  Info,
} from "lucide-react";
import { useProduct } from "@/hooks/queries/use-products";
import { productsApi } from "@/resources/apis/products.api";
import type { Product, ProductVariant } from "@/resources/interfaces/product.interface";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";

interface ProductDetailsDialogProps {
  productId?: string;
  initialProduct?: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated?: () => void;
}

function parseProductSpecs(description: string = "") {
  let materials = "";
  let dimensions = "";
  let careInstructions = "";
  let origin = "";
  let personalizationPrompt = "";
  let allowPersonalization = false;

  const matMatch = description.match(/- \*\*Materials:\*\* ([^\n\r]+)/);
  if (matMatch) materials = matMatch[1].trim();

  const dimMatch = description.match(/- \*\*Dimensions:\*\* ([^\n\r]+)/);
  if (dimMatch) dimensions = dimMatch[1].trim();

  const careMatch = description.match(/- \*\*Care Instructions:\*\* ([^\n\r]+)/);
  if (careMatch) careInstructions = careMatch[1].trim();

  const origMatch = description.match(/- \*\*Workshop Origin:\*\* ([^\n\r]+)/);
  if (origMatch) origin = origMatch[1].trim();

  const persMatch = description.match(/- \*\*Personalization Instructions:\*\* ([^\n\r]+)/);
  if (persMatch) {
    personalizationPrompt = persMatch[1].trim();
    allowPersonalization = true;
  }

  const cleanDescription = description.split(/### Specifications/i)[0].trim();

  return {
    cleanDescription,
    materials,
    dimensions,
    careInstructions,
    origin,
    personalizationPrompt,
    allowPersonalization,
  };
}

export function ProductDetailsDialog({
  productId,
  initialProduct,
  open,
  onOpenChange,
  onProductUpdated,
}: ProductDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { data: fetchedProduct, isLoading } = useProduct(productId || "");

  const product = fetchedProduct || initialProduct;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product && !isLoading) {
    return null;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleApprove = async () => {
    if (!product) return;
    setIsProcessing(true);
    try {
      await productsApi.approveProduct(product.id);
      toast.success(`Product "${product.name}" approved successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(product.id) });
      onProductUpdated?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve product.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!product) return;
    setIsProcessing(true);
    try {
      await productsApi.publishProduct(product.id);
      toast.success(`Product "${product.name}" published to marketplace.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(product.id) });
      onProductUpdated?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish product.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!product) return;
    const reason = window.prompt("Enter rejection reason for store admin:", "Does not meet marketplace quality standards");
    if (reason === null) return;
    setIsProcessing(true);
    try {
      await productsApi.rejectProduct(product.id, reason || "Does not meet marketplace standards");
      toast.success(`Product "${product.name}" rejected.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(product.id) });
      onProductUpdated?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject product.");
    } finally {
      setIsProcessing(false);
    }
  };

  const specs = parseProductSpecs(product?.description || "");
  const images = product?.images || [];
  const variants = product?.variants || [];
  const primaryImage = images.find((img) => img.isPrimary) || images[0];

  const totalStock = variants.length > 0
    ? variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121217] border border-[#1E1E26] text-white p-6 shadow-2xl rounded-2xl">
        {isLoading && !product ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-8 text-[#E11D48] animate-spin" />
            <p className="text-xs text-[#8E8F99]">Loading product details from database...</p>
          </div>
        ) : product ? (
          <>
            {/* Dialog Header */}
            <DialogHeader className="border-b border-[#1E1E26] pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-xl font-bold text-white tracking-tight">
                      {product.name}
                    </DialogTitle>
                    <Badge
                      variant={
                        product.status === "PUBLISHED"
                          ? "success"
                          : product.status === "APPROVED"
                          ? "secondary"
                          : product.status === "DRAFT"
                          ? "outline"
                          : "default"
                      }
                      className="text-[11px] font-semibold tracking-wider uppercase"
                    >
                      {product.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8E8F99]">
                    <div className="flex items-center gap-1 font-mono">
                      <span>SKU: {product.sku || "N/A"}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(product.sku, "SKU")}
                        className="text-[#6F707E] hover:text-white p-0.5 rounded transition-colors"
                        title="Copy SKU"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>

                    {product.store && (
                      <div className="flex items-center gap-1 text-[#8E8F99]">
                        <Store className="size-3 text-[#E11D48]" />
                        <span>Store: <strong className="text-white font-medium">{product.store.name}</strong></span>
                      </div>
                    )}

                    {product.slug && (
                      <a
                        href={`http://localhost:4242/products/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#E11D48] hover:underline"
                      >
                        <span>View in Buyer Storefront</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
              <div className="p-3.5 rounded-xl border border-[#1E1E26] bg-[#16161D]/70 space-y-1">
                <div className="text-[11px] font-medium text-[#8E8F99] flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-emerald-400" />
                  <span>Base Price</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  ${product.price}
                </div>
                <div className="text-[10px] text-[#6F707E]">
                  {product.vatIncluded ? "VAT Included in price" : "Excl. VAT"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#1E1E26] bg-[#16161D]/70 space-y-1">
                <div className="text-[11px] font-medium text-[#8E8F99] flex items-center gap-1.5">
                  <Percent className="size-3.5 text-blue-400" />
                  <span>Finnish ALV / VAT</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {product.vatRate}%
                </div>
                <div className="text-[10px] text-[#6F707E]">
                  Tax Code: {product.vatCode || "FI-ALV-STD"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#1E1E26] bg-[#16161D]/70 space-y-1">
                <div className="text-[11px] font-medium text-[#8E8F99] flex items-center gap-1.5">
                  <Layers className="size-3.5 text-amber-400" />
                  <span>Total Workshop Stock</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {product.trackInventory ? totalStock : "Untracked"}
                </div>
                <div className="text-[10px] text-[#6F707E]">
                  Across {variants.length || 1} variant option(s)
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#1E1E26] bg-[#16161D]/70 space-y-1">
                <div className="text-[11px] font-medium text-[#8E8F99] flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-purple-400" />
                  <span>Created Date</span>
                </div>
                <div className="text-xs font-semibold text-white pt-1">
                  {formatDate(product.createdAt)}
                </div>
                <div className="text-[10px] text-[#6F707E]">
                  Updated: {formatDate(product.updatedAt)}
                </div>
              </div>
            </div>

            {/* Main Tabs Details */}
            <Tabs defaultValue="overview" className="w-full space-y-4">
              <TabsList className="bg-[#16161D] border border-[#22222C] p-1 rounded-xl">
                <TabsTrigger
                  value="overview"
                  className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
                >
                  <FileText className="size-3.5 mr-1.5" />
                  <span>Overview &amp; Story</span>
                </TabsTrigger>
                <TabsTrigger
                  value="variants"
                  className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
                >
                  <Sliders className="size-3.5 mr-1.5" />
                  <span>Selectable Options ({variants.length})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
                >
                  <ShieldCheck className="size-3.5 mr-1.5" />
                  <span>Specifications &amp; Craft</span>
                </TabsTrigger>
                {images.length > 0 && (
                  <TabsTrigger
                    value="gallery"
                    className="text-xs rounded-lg data-[state=active]:bg-[#E11D48] data-[state=active]:text-white"
                  >
                    <Package className="size-3.5 mr-1.5" />
                    <span>Media Gallery ({images.length})</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab 1: Overview */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Column Image Preview */}
                  <div className="md:col-span-4">
                    {primaryImage?.url ? (
                      <div className="rounded-xl overflow-hidden border border-[#1E1E26] aspect-square bg-[#16161D]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={primaryImage.url}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[#22222C] bg-[#16161D]/50 aspect-square flex flex-col items-center justify-center text-[#6F707E] space-y-2">
                        <Package className="size-10 stroke-1" />
                        <span className="text-xs">No media uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column Product Narrative */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="p-4 rounded-xl border border-[#1E1E26] bg-[#16161D]/60 space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E8F99]">
                        Artisan Story &amp; Description
                      </h4>
                      <p className="text-xs text-white/90 leading-relaxed whitespace-pre-line">
                        {specs.cleanDescription || "No detailed craft description provided by the artisan."}
                      </p>
                    </div>

                    {/* Taxonomy & Metadata list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-[#1E1E26] bg-[#16161D]/40 space-y-1">
                        <span className="text-[#6F707E] text-[11px] block">Product UUID</span>
                        <span className="font-mono text-white text-[11px] break-all">{product.id}</span>
                      </div>

                      <div className="p-3 rounded-lg border border-[#1E1E26] bg-[#16161D]/40 space-y-1">
                        <span className="text-[#6F707E] text-[11px] block">Slug URL Handle</span>
                        <span className="font-mono text-white text-[11px] break-all">/products/{product.slug}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Selectable Options & Variants */}
              <TabsContent value="variants" className="space-y-4">
                <div className="rounded-xl border border-[#1E1E26] bg-[#16161D]/60 overflow-hidden">
                  <div className="p-3.5 border-b border-[#1E1E26] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Configured Product Options</h4>
                      <p className="text-[11px] text-[#6F707E]">Selectable customer variants in the buyer portal</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-[#121217] border-[#22222C] text-[#8E8F99]">
                      {variants.length} Variant(s)
                    </Badge>
                  </div>

                  {variants.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#6F707E]">
                      This item has a single standard option with no variants configured.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="w-full text-xs">
                        <TableHeader className="bg-[#121217]/50 border-b border-[#1E1E26]">
                          <TableRow>
                            <TableHead className="text-[#6F707E]">Size / Set</TableHead>
                            <TableHead className="text-[#6F707E]">Color / Glaze</TableHead>
                            <TableHead className="text-[#6F707E]">Model</TableHead>
                            <TableHead className="text-[#6F707E]">SKU</TableHead>
                            <TableHead className="text-[#6F707E]">Price Override</TableHead>
                            <TableHead className="text-[#6F707E]">Stock Qty</TableHead>
                            <TableHead className="text-[#6F707E]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variants.map((v: ProductVariant) => (
                            <TableRow key={v.id} className="border-b border-[#1A1A22] hover:bg-[#1C1C24]/50">
                              <TableCell className="font-medium text-white">
                                {v.size || "Standard"}
                              </TableCell>
                              <TableCell className="text-[#8E8F99]">
                                {v.color || "Default"}
                              </TableCell>
                              <TableCell className="text-[#8E8F99]">
                                {v.model || "—"}
                              </TableCell>
                              <TableCell className="font-mono text-[11px] text-[#8E8F99]">
                                {v.sku}
                              </TableCell>
                              <TableCell className="font-mono font-semibold text-white">
                                {v.price ? `$${v.price}` : `$${product.price}`}
                              </TableCell>
                              <TableCell className="font-mono">
                                <span className={v.stockQuantity <= (v.lowStockThreshold || 2) ? "text-amber-400 font-semibold" : "text-white"}>
                                  {v.stockQuantity}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                                  <span className="size-1.5 rounded-full bg-emerald-400" />
                                  <span>Active</span>
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 3: Specifications & Craftsmanship */}
              <TabsContent value="specifications" className="space-y-4">
                <div className="rounded-xl border border-[#1E1E26] bg-[#16161D]/60 overflow-hidden divide-y divide-[#1E1E26]">
                  <div className="p-4 flex items-start gap-4">
                    <Tag className="size-4 text-[#E11D48] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-[#8E8F99] uppercase tracking-wider">
                        Materials &amp; Composition
                      </span>
                      <p className="text-xs text-white font-medium mt-0.5">
                        {specs.materials || "High-fire stoneware clay / natural handcrafted artisan materials"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4">
                    <Sliders className="size-4 text-[#E11D48] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-[#8E8F99] uppercase tracking-wider">
                        Dimensions &amp; Capacity
                      </span>
                      <p className="text-xs text-white font-medium mt-0.5">
                        {specs.dimensions || "Standard artisan dimensions (refer to option selection)"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4">
                    <ShieldCheck className="size-4 text-[#E11D48] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-[#8E8F99] uppercase tracking-wider">
                        Care &amp; Usage Instructions
                      </span>
                      <p className="text-xs text-white font-medium mt-0.5">
                        {specs.careInstructions || "Oven safe to 250°C, microwave & dishwasher safe. Avoid sudden thermal shocks."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4">
                    <Store className="size-4 text-[#E11D48] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-[#8E8F99] uppercase tracking-wider">
                        Workshop Origin Location
                      </span>
                      <p className="text-xs text-white font-medium mt-0.5">
                        {specs.origin || "Aleksanterinkatu 15, 00100 Helsinki, Finland"}
                      </p>
                    </div>
                  </div>

                  {specs.allowPersonalization && (
                    <div className="p-4 flex items-start gap-4 bg-[#E11D48]/5">
                      <Sparkles className="size-4 text-[#E11D48] shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] font-semibold text-[#E11D48] uppercase tracking-wider">
                          Buyer Personalization Enabled
                        </span>
                        <p className="text-xs text-white font-medium mt-0.5">
                          {specs.personalizationPrompt || "Custom engraving / text input requested from customer."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 4: Gallery */}
              {images.length > 0 && (
                <TabsContent value="gallery" className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`group relative aspect-square rounded-xl overflow-hidden border ${
                          img.isPrimary ? "border-[#E11D48] ring-2 ring-[#E11D48]/20" : "border-[#1E1E26]"
                        } bg-[#16161D]`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.altText || `Product Image ${idx + 1}`}
                          className="size-full object-cover"
                        />
                        {img.isPrimary && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#E11D48] text-white text-[9px] font-bold uppercase tracking-wider rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Dialog Footer Actions */}
            <DialogFooter className="border-t border-[#1E1E26] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {product.status !== "PUBLISHED" && (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isProcessing}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold px-4"
                  >
                    {isProcessing ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <CheckCircle className="size-3.5 mr-1.5" />}
                    <span>Publish to Marketplace</span>
                  </Button>
                )}

                {product.status === "DRAFT" || product.status === "PENDING_APPROVAL" ? (
                  <Button
                    type="button"
                    onClick={handleApprove}
                    disabled={isProcessing}
                    size="sm"
                    variant="outline"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-lg text-xs font-semibold"
                  >
                    <CheckCircle className="size-3.5 mr-1.5" />
                    <span>Approve Product</span>
                  </Button>
                ) : null}

                {product.status !== "REJECTED" && (
                  <Button
                    type="button"
                    onClick={handleReject}
                    disabled={isProcessing}
                    size="sm"
                    variant="outline"
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs"
                  >
                    <XCircle className="size-3.5 mr-1.5" />
                    <span>Reject</span>
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto border-[#22222C] bg-[#16161D] text-[#8E8F99] hover:text-white rounded-lg text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

