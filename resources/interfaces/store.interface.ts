import { PaginatedResponse, PaginationParams } from "./user.interface";

export type StoreStatus =
  | "UNDER_REVIEW"
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "SUSPENDED"
  | "REJECTED";

export interface UpdateStorePayload {
  name?: string;
  legalBusinessName?: string;
  businessId?: string;
  vatId?: string | null;
  address?: string | null;
  phone?: string | null;
  contactName?: string | null;
  status?: StoreStatus;
  currency?: string;
  timezone?: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  autoSubmitProducts?: boolean;
  defaultLowStockThreshold?: number;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
}

export interface UpdateStoreStatusPayload {
  status: StoreStatus;
  reason?: string;
}

export interface StoreAdminRelation {
  id: string;
  userId: string;
  storeId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
}

export interface Store {
  id: string;
  name: string;
  legalBusinessName: string;
  businessId: string;
  vatId: string | null;
  address: string | null;
  phone: string | null;
  contactName: string | null;
  sellerAgreementAccepted: boolean;
  status: StoreStatus;
  rejectionReason: string | null;
  suspensionReason: string | null;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  currency: string;
  timezone: string;
  autoSubmitProducts: boolean;
  defaultLowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
  storeAdmins?: StoreAdminRelation[];
}

export interface GetStoresParams extends PaginationParams {
  status?: StoreStatus;
  search?: string;
}

export type PaginatedStoresResponse = PaginatedResponse<Store>;
