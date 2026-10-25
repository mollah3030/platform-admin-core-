export interface InvoiceItemSnapshot {
  productId?: string | null;
  productTitle: string;
  variantId?: string;
  sku?: string;
  storeId: string;
  storeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type InvoiceStatus = 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  storeId?: string | null;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  billingAddress?: Record<string, unknown> | null;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  paymentMethod: string;
  paymentReference?: string | null;
  itemsSnapshot: InvoiceItemSnapshot[];
  pdfUrl?: string | null;
  issuedAt: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
  };
  store?: {
    id: string;
    name: string;
  } | null;
}

export interface PaginatedInvoicesResponse {
  items: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  search?: string;
  orderId?: string;
}
