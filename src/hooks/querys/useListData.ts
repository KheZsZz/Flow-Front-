import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orders";
import { invoiceService } from "@/services/invoices";
import { usersService } from "@/services/users";
import {
  operationalExpenseService,
  administrativeExpenseService,
  expenseTypesService,
} from "@/services/expenses";
import { fuelService } from "@/services/fuel";

import {
  maintenanceService,
  maintenanceTypesService,
  MaintenanceCategory,
  MaintenanceTypeItem,
} from "@/services/maintenance";

export const listKeys = {
  orders: ["orders"] as const,
  users: ["users"] as const,
  invoices: ["invoices"] as const,
  operationalExpenses: ["expenses", "operational"] as const,
  administrativeExpenses: ["expenses", "administrative"] as const,
  expenseTypes: (category?: string) =>
    ["expenses", "types", category ?? "all"] as const,
  maintenances: ["maintenance"] as const,
  fuel: ["fuel"] as const,
  maintenanceTypes: (category?: string) =>
    ["maintenance", "types", category ?? "all"] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: listKeys.orders,
    queryFn: async () => {
      const data = await orderService.getOrders();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000,
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

export function useOperationalExpenses() {
  return useQuery({
    queryKey: listKeys.operationalExpenses,
    queryFn: async () => {
      const data = await operationalExpenseService.list();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000,
  });
}

export function useAdministrativeExpenses() {
  return useQuery({
    queryKey: listKeys.administrativeExpenses,
    queryFn: async () => {
      const data = await administrativeExpenseService.list();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000,
  });
}

export function useExpenseTypes(category?: "Operacional" | "Administrativo") {
  return useQuery({
    queryKey: listKeys.expenseTypes(category),
    queryFn: async () => {
      const data = await expenseTypesService.list(category);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60 * 1000, // tipos mudam pouco, cache mais longo
  });
}

export function useMaintenances() {
  return useQuery({
    queryKey: listKeys.maintenances,
    queryFn: async () => {
      const data = await maintenanceService.list();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000,
  });
}

export function useFuelEntries() {
  return useQuery({
    queryKey: listKeys.fuel,
    queryFn: async () => {
      const data = await fuelService.list();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000,
  });
}

export function useMaintenanceTypes(category?: MaintenanceCategory) {
  return useQuery({
    queryKey: listKeys.maintenanceTypes(category),
    queryFn: async () => {
      const data = await maintenanceTypesService.list(category);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60 * 1000, // cache mais longo — mudam pouco
  });
}
