import { api } from "@/services/api";

export interface ExpenseType {
  id: string;
  name: string;
  category: "Operacional" | "Administrativo";
  is_active: boolean;
}

export interface OperationalExpensePayload {
  expense_type_id: string;
  order_id?: string | null;
  vehicle_id?: string | null;
  description?: string | null;
  amount: number;
  expense_date?: string | Date;
  receipt_url?: string | null;
}

export interface AdministrativeExpensePayload {
  expense_type_id: string;
  department?: string | null;
  description?: string | null;
  amount: number;
  expense_date?: string | Date;
  receipt_url?: string | null;
}

// ── Tipos de despesa (compartilhado entre as duas abas) ──
export const expenseTypesService = {
  async list(category?: "Operacional" | "Administrativo") {
    const res = await api.get("/expenses/types", {
      params: category ? { category } : undefined,
    });
    return res.data;
  },

  async create(payload: {
    name: string;
    category: "Operacional" | "Administrativo";
  }) {
    const res = await api.post("/expenses/types", payload);
    return res.data;
  },

  async disable(id: string) {
    const res = await api.patch(`/expenses/types/${id}`);
    return res.data;
  },
};

// ── Custos Operacionais ──
export const operationalExpenseService = {
  async list() {
    const res = await api.get("/expenses/operational");
    return res.data;
  },

  async create(payload: OperationalExpensePayload) {
    const res = await api.post("/expenses/operational", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<OperationalExpensePayload>) {
    const res = await api.put(`/expenses/operational/${id}`, payload);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.patch(`/expenses/operational/${id}`);
    return res.data;
  },
};

// ── Custos Administrativos ──
export const administrativeExpenseService = {
  async list() {
    const res = await api.get("/expenses/administrative");
    return res.data;
  },

  async create(payload: AdministrativeExpensePayload) {
    const res = await api.post("/expenses/administrative", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<AdministrativeExpensePayload>) {
    const res = await api.put(`/expenses/administrative/${id}`, payload);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.patch(`/expenses/administrative/${id}`);
    return res.data;
  },
};
