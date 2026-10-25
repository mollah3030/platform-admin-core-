import { PaginatedResponse, PaginationParams } from "./user.interface";
import { Store } from "./store.interface";

export type ProductStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  model?: string;
  sku: string;
  price: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: string;
  vatRate: string;
  vatIncluded: boolean;
  vatCode: string | null;
  status: ProductStatus;
  rejectionReason: string | null;
  trackInventory: boolean;
  createdAt: string;
  updatedAt: string;
  store?: Store;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface GetProductsParams extends PaginationParams {
  status?: ProductStatus;
  storeId?: string;
  search?: string;
}

export type PaginatedProductsResponse = PaginatedResponse<Product>;
