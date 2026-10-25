import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { invoicesApi } from "@/resources/apis/invoices.api";
import type {
  InvoiceQueryParams,
  PaginatedInvoicesResponse,
  Invoice,
} from "@/resources/interfaces/invoice.interface";

export function useInvoices(params?: InvoiceQueryParams) {
  return useQuery<PaginatedInvoicesResponse>({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => invoicesApi.getInvoices(params),
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoicesApi.getInvoiceById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
