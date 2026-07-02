import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orders";
import { invoiceService } from "@/services/invoices";
import { usersService } from "@/services/users";

export const listKeys = {
  orders: ["orders"] as const,
  invoices: ["invoices"] as const,
  users: ["users"] as const, // NOVO
};

export function useOrders() {
  return useQuery({
    queryKey: listKeys.orders,
    queryFn: async () => {
      const data = await orderService.getOrders();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000, // transacional: revalida em background ao focar
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: listKeys.invoices,
    queryFn: async () => {
      const data = await invoiceService.getInvoices();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: listKeys.users,
    queryFn: async () => {
      const data = await usersService.list();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000, // mesma janela usada em orders/invoices
  });
}
