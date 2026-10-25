"use client";

import React, { useState } from "react";
import {
  FolderTree,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  RotateCw,
  Folder,
  FolderPlus,
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
  List,
  GitBranch,
} from "lucide-react";
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
import {
  useCategories,
  useCategoryTree,
  useCategoryMutations,
} from "@/hooks/queries/use-categories";
import type {
  Category,
  CategoryStatus,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/resources/interfaces/category.interface";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function CategoriesView() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form States for Create
  const [createForm, setCreateForm] = useState<CreateCategoryDto>({
    name: "",
    description: "",
    imageUrl: "",
    parentId: undefined,
    sortOrder: 0,
    status: "ACTIVE",
  });

  // Form States for Edit
  const [editForm, setEditForm] = useState<UpdateCategoryDto>({
    name: "",
    description: "",
    imageUrl: "",
    parentId: undefined,
    sortOrder: 0,
    status: "ACTIVE",
  });

  // Queries & Mutations
  const { data: categories = [], isLoading, refetch } = useCategories(
    statusFilter !== "all" ? (statusFilter as CategoryStatus) : undefined,
  );
  const { data: treeCategories = [], isLoading: treeLoading, refetch: refetchTree } = useCategoryTree();
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations();

  // Metrics
  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.status === "ACTIVE").length;
  const rootCount = categories.filter((c) => !c.parentId).length;
  const subCount = categories.filter((c) => !!c.parentId).length;

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  });

  // Handle open create
  const handleOpenCreate = (parentId?: string) => {
    setCreateForm({
      name: "",
      description: "",
      imageUrl: "",
      parentId: parentId || undefined,
      sortOrder: 0,
      status: "ACTIVE",
    });
    setCreateOpen(true);
  };

  // Handle submit create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    await createCategory.mutateAsync({
      name: createForm.name.trim(),
      description: createForm.description?.trim() || undefined,
      imageUrl: createForm.imageUrl?.trim() || undefined,
      parentId: createForm.parentId || undefined,
      sortOrder: Number(createForm.sortOrder) || 0,
      status: createForm.status || "ACTIVE",
    });
    setCreateOpen(false);
  };

  // Handle open edit
  const handleOpenEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setEditForm({
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      parentId: cat.parentId || undefined,
      sortOrder: cat.sortOrder,
      status: cat.status,
    });
    setEditOpen(true);
  };

  // Handle submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;
    if (!editForm.name?.trim()) {
      toast.error("Category name is required.");
      return;
    }
    await updateCategory.mutateAsync({
      id: categoryToEdit.id,
      dto: {
        name: editForm.name.trim(),
        description: editForm.description?.trim() || undefined,
        imageUrl: editForm.imageUrl?.trim() || undefined,
        parentId: editForm.parentId || undefined,
        sortOrder: Number(editForm.sortOrder) || 0,
        status: editForm.status || "ACTIVE",
      },
    });
    setEditOpen(false);
    setCategoryToEdit(null);
  };

  // Handle toggle status quickly
  const handleToggleStatus = async (cat: Category) => {
    const nextStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateCategory.mutateAsync({
      id: cat.id,
      dto: { status: nextStatus },
    });
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    await deleteCategory.mutateAsync(categoryToDelete.id);
    setDeleteOpen(false);
    setCategoryToDelete(null);
  };

  // Build parent lookup map
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Platform Categories
            </h1>
            <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[10px] font-semibold tracking-wide">
              Product Taxonomy
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#7D7E8B]">
            Global marketplace taxonomy managed by Superadmin. Store admins select these categories when listing products.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              refetchTree();
            }}
            className="h-9 rounded-xl bg-[#14141A] border-[#22222C] text-[#8E8F99] hover:text-white gap-1.5 text-xs font-medium"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenCreate()}
            className="h-9 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white gap-1.5 text-xs font-semibold shadow-md shadow-rose-950/40"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Category</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Categories */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              TOTAL CATEGORIES
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <FolderTree className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                {totalCount}
              </div>
            )}
            <p className="mt-1 text-[11px] text-[#6F707E]">
              Platform-wide product classifications
            </p>
          </div>
        </div>

        {/* KPI 2: Active Categories */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              ACTIVE TAXONOMY
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                {activeCount}
              </div>
            )}
            <p className="mt-1 text-[11px] text-emerald-400 font-medium">
              Available for store vendor selection
            </p>
          </div>
        </div>

        {/* KPI 3: Root Categories */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              ROOT CATEGORIES
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                {rootCount}
              </div>
            )}
            <p className="mt-1 text-[11px] text-[#6F707E]">
              Top-level catalog departments
            </p>
          </div>
        </div>

        {/* KPI 4: Subcategories */}
        <div className="rounded-2xl bg-[#121217] border border-[#1E1E26] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F707E]">
              SUBCATEGORIES
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GitBranch className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-[#1A1A22]" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                {subCount}
              </div>
            )}
            <p className="mt-1 text-[11px] text-[#6F707E]">
              Nested granular child categories
            </p>
          </div>
        </div>
      </div>

      {/* Info Callout Box */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-3 text-xs text-[#A2A3B0]">
        <Info className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">How Categories Work in Multi-Tenant Marketplace:</span>{" "}
          Superadmin defines the global taxonomy below. When a tenant Store Admin or vendor lists a product in their store admin panel, they select from these categories. This powers marketplace search, category filtering, and cross-store catalogs.
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6F707E]" />
          <Input
            type="search"
            placeholder="Search categories by name or slug..."
            className="pl-9 text-xs h-9 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E] focus-visible:ring-1 focus-visible:ring-rose-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-[#16161D] border-[#22222C] text-[#E0E0E6]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-[#E0E0E6]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#16161D] border border-[#22222C] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-rose-500/20 text-white font-semibold shadow-sm"
                  : "text-[#7D7E8B] hover:text-white"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "tree"
                  ? "bg-rose-500/20 text-white font-semibold shadow-sm"
                  : "text-[#7D7E8B] hover:text-white"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Hierarchy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Categories Container */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden w-full">
        {isLoading || treeLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-[#181820] rounded-xl" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No categories created yet</h3>
            <p className="text-xs text-[#7D7E8B] mt-1 max-w-sm">
              Create the first platform-wide category so store admins can organize and categorize their products.
            </p>
            <Button
              size="sm"
              onClick={() => handleOpenCreate()}
              className="mt-4 h-9 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Category</span>
            </Button>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[700px]">
              <TableHeader>
                <TableRow className="border-b border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">
                    Category Name &amp; Slug
                  </TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">
                    Hierarchy Level
                  </TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">
                    Sort Order
                  </TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">
                    Created
                  </TableHead>
                  <TableHead className="text-right text-[#6F707E] text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => {
                  const parent = cat.parentId ? categoryMap.get(cat.parentId) : null;
                  return (
                    <TableRow
                      key={cat.id}
                      className="border-b border-[#1A1A22] hover:bg-[#16161D] transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs">
                            {cat.parentId ? (
                              <GitBranch className="h-4 w-4 text-purple-400" />
                            ) : (
                              <Folder className="h-4 w-4 text-rose-400" />
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-semibold text-sm text-white block">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-[#6F707E] font-mono block">
                              /{cat.slug}
                            </span>
                            {cat.description && (
                              <span className="text-[11px] text-[#8E8F99] line-clamp-1">
                                {cat.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {parent ? (
                          <div className="flex items-center gap-1.5 text-xs text-purple-300">
                            <span className="text-[#6F707E]">Under:</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-purple-500/10 border-purple-500/20 text-purple-300"
                            >
                              {parent.name}
                            </Badge>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-blue-500/10 border-blue-500/20 text-blue-300 font-medium"
                          >
                            Top-Level (Root)
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={cat.status === "ACTIVE" ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {cat.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs font-mono text-white">
                        {cat.sortOrder}
                      </TableCell>

                      <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                        {formatDate(cat.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#7D7E8B] hover:text-white hover:bg-white/[0.05]"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-[#14141A] border-[#22222C] text-[#E0E0E6]"
                          >
                            <DropdownMenuLabel className="text-xs text-[#7D7E8B]">
                              Category Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#22222C]" />

                            <DropdownMenuItem
                              onClick={() => handleOpenCreate(cat.id)}
                              className="cursor-pointer hover:bg-white/5 flex items-center text-white"
                            >
                              <FolderPlus className="mr-2 h-4 w-4 text-purple-400" />
                              Add Subcategory
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(cat)}
                              className="cursor-pointer hover:bg-white/5 flex items-center text-white"
                            >
                              <Edit className="mr-2 h-4 w-4 text-blue-400" />
                              Edit Category
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(cat)}
                              className="cursor-pointer hover:bg-white/5 flex items-center text-white"
                            >
                              {cat.status === "ACTIVE" ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4 text-amber-400" />
                                  Set Inactive
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" />
                                  Set Active
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-[#22222C]" />

                            <DropdownMenuItem
                              onClick={() => {
                                setCategoryToDelete(cat);
                                setDeleteOpen(true);
                              }}
                              className="cursor-pointer hover:bg-rose-500/10 text-rose-400 focus:text-rose-400 flex items-center"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Tree View */
          <div className="p-4 sm:p-6 divide-y divide-[#1A1A22]">
            {treeCategories.map((root) => (
              <TreeCategoryRow
                key={root.id}
                category={root}
                level={0}
                onAddSub={handleOpenCreate}
                onEdit={handleOpenEdit}
                onDelete={(cat) => {
                  setCategoryToDelete(cat);
                  setDeleteOpen(true);
                }}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Category Modal Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <FolderPlus className="h-5 w-5 text-rose-400" />
              Create Platform Category
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Define a new category in the global marketplace taxonomy for store vendors to categorize products.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name" className="text-xs text-[#A2A3B0]">
                Category Name <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="create-name"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Bakery & Pastries, Electronics, Apparel..."
                className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl focus-visible:ring-rose-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-parent" className="text-xs text-[#A2A3B0]">
                Parent Category (Optional)
              </Label>
              <Select
                value={createForm.parentId || "none"}
                onValueChange={(val) =>
                  setCreateForm({
                    ...createForm,
                    parentId: val === "none" ? undefined : val,
                  })
                }
              >
                <SelectTrigger id="create-parent" className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Select parent category or leave top-level" />
                </SelectTrigger>
                <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-white max-h-56">
                  <SelectItem value="none">None (Top-Level Category)</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.parentId ? "(Subcategory)" : "(Root)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-desc" className="text-xs text-[#A2A3B0]">
                Description (Optional)
              </Label>
              <Textarea
                id="create-desc"
                value={createForm.description || ""}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Brief description of products categorized under this group..."
                className="bg-[#16161D] border-[#22222C] text-white text-xs min-h-[70px] rounded-xl focus-visible:ring-rose-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-sort" className="text-xs text-[#A2A3B0]">
                  Sort Order
                </Label>
                <Input
                  id="create-sort"
                  type="number"
                  value={createForm.sortOrder}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-status" className="text-xs text-[#A2A3B0]">
                  Status
                </Label>
                <Select
                  value={createForm.status}
                  onValueChange={(val: CategoryStatus) =>
                    setCreateForm({ ...createForm, status: val })
                  }
                >
                  <SelectTrigger id="create-status" className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-white">
                    <SelectItem value="ACTIVE">ACTIVE (Store Visible)</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="bg-[#1A1A24] border-[#2A2A36] text-white text-xs h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending || !createForm.name.trim()}
                className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs h-9 rounded-xl font-semibold"
              >
                {createCategory.isPending ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Edit className="h-5 w-5 text-blue-400" />
              Edit Category
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Modify details for <strong className="text-white">{categoryToEdit?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs text-[#A2A3B0]">
                Category Name <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="edit-name"
                required
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl focus-visible:ring-rose-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-parent" className="text-xs text-[#A2A3B0]">
                Parent Category
              </Label>
              <Select
                value={editForm.parentId || "none"}
                onValueChange={(val) =>
                  setEditForm({
                    ...editForm,
                    parentId: val === "none" ? undefined : val,
                  })
                }
              >
                <SelectTrigger id="edit-parent" className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-white max-h-56">
                  <SelectItem value="none">None (Top-Level Category)</SelectItem>
                  {categories
                    .filter((c) => c.id !== categoryToEdit?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.parentId ? "(Subcategory)" : "(Root)"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc" className="text-xs text-[#A2A3B0]">
                Description
              </Label>
              <Textarea
                id="edit-desc"
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-[#16161D] border-[#22222C] text-white text-xs min-h-[70px] rounded-xl focus-visible:ring-rose-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-sort" className="text-xs text-[#A2A3B0]">
                  Sort Order
                </Label>
                <Input
                  id="edit-sort"
                  type="number"
                  value={editForm.sortOrder || 0}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-xs text-[#A2A3B0]">
                  Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val: CategoryStatus) =>
                    setEditForm({ ...editForm, status: val })
                  }
                >
                  <SelectTrigger id="edit-status" className="bg-[#16161D] border-[#22222C] text-white text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-white">
                    <SelectItem value="ACTIVE">ACTIVE (Store Visible)</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="bg-[#1A1A24] border-[#2A2A36] text-white text-xs h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateCategory.isPending || !editForm.name?.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-xl font-semibold"
              >
                {updateCategory.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-[#14141A] border-[#22222C] text-white max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-[#8E8F99]">
              Are you sure you want to delete <strong className="text-white">{categoryToDelete?.name}</strong>?
              Categories with existing subcategories or active vendor products cannot be deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="bg-[#1A1A24] border-[#2A2A36] text-white text-xs h-9 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteCategory.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 rounded-xl font-semibold"
            >
              {deleteCategory.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tree View Recursive Component
function TreeCategoryRow({
  category,
  level = 0,
  onAddSub,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  category: Category;
  level: number;
  onAddSub: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="py-2.5">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#16161D] border border-[#20202A] hover:border-rose-500/30 transition-all"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-white/10 rounded-lg text-[#8E8F99] transition-colors"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
              level === 0
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            }`}
          >
            {level === 0 ? <Folder className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-white truncate">
                {category.name}
              </span>
              <span className="text-[11px] text-[#6F707E] font-mono">
                /{category.slug}
              </span>
              <Badge
                variant={category.status === "ACTIVE" ? "success" : "secondary"}
                className="text-[10px]"
              >
                {category.status}
              </Badge>
            </div>
            {category.description && (
              <p className="text-xs text-[#8E8F99] line-clamp-1">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddSub(category.id)}
            className="h-8 px-2.5 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1 rounded-lg"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Sub</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-8 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="h-8 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="space-y-1.5 mt-1.5">
          {category.children!.map((child) => (
            <TreeCategoryRow
              key={child.id}
              category={child}
              level={level + 1}
              onAddSub={onAddSub}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
