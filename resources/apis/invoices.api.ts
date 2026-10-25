import { apiClient } from "@/lib/axios";
import type {
  Invoice,
  PaginatedInvoicesResponse,
  InvoiceQueryParams,
} from "@/resources/interfaces/invoice.interface";

export const invoicesApi = {
  async getInvoices(params?: InvoiceQueryParams): Promise<PaginatedInvoicesResponse> {
    const response = await apiClient.get<PaginatedInvoicesResponse>("/admin/invoices", {
      params,
    });
    return response.data;
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/admin/invoices/${id}`);
    return response.data;
  },

  async getInvoiceHtml(id: string): Promise<string> {
    const response = await apiClient.get<string>(`/admin/invoices/${id}/html`, {
      responseType: "text" as any,
    });
    return response.data;
  },
};
