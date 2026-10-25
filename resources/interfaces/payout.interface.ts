export interface PlatformRevenueSummary {
  gmv: number;
  totalPlatformFees: number;
  commissionRatePercent: number;
  totalPendingEscrow: number;
  totalAvailableForPayout: number;
  totalDisbursedPayouts: number;
  defaultHoldDays: number;
  minimumPayoutThreshold: number;
  currency: string;
}

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PayoutMethod = 'STRIPE_CONNECT' | 'BANK_TRANSFER' | 'MANUAL';

export interface PayoutDestinationDetails {
  bankAccountName?: string;
  bankAccountNumberMasked?: string;
  bankIban?: string;
  stripeAccountId?: string;
}

export interface StorePayoutItem {
  id: string;
  payoutNumber: string;
  storeId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  payoutMethod: PayoutMethod;
  destinationDetails?: PayoutDestinationDetails;
  failureReason?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPayoutsResponse {
  items: StorePayoutItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PayoutQueryParams {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
  storeId?: string;
}
