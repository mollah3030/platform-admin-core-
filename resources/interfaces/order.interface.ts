import { PaginatedResponse, PaginationParams } from "./user.interface";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "PARTIALLY_SHIPPED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
  totalAmount: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface GetOrdersParams extends PaginationParams {
  status?: OrderStatus;
  storeId?: string;
  customerId?: string;
  search?: string;
}

export type PaginatedOrdersResponse = PaginatedResponse<Order>;
