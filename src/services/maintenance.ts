import { api } from "@/services/api";

export interface MaintenancePayload {
  vehicle_id: string;
  maintenance_type_id: string;
  maintenance_type?: string | null;
  description?: string | null;
  cost: number;
  odometer?: number | null;
  performed_at?: string | Date;
  next_due_at?: string | Date | null;
  receipt_url?: string | null;
}

export const maintenanceService = {
  async list() {
    const res = await api.get("/maintenance");
    return res.data;
  },

  async create(payload: MaintenancePayload) {
    const res = await api.post("/maintenance", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<MaintenancePayload>) {
    const res = await api.put(`/maintenance/${id}`, payload);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.patch(`/maintenance/${id}`);
    return res.data;
  },
};

export type MaintenanceCategory = "Preventiva" | "Corretiva";

export interface MaintenanceTypeItem {
  id: string;
  name: string;
  category: MaintenanceCategory;
  is_active: boolean;
}

export const maintenanceTypesService = {
  async list(category?: MaintenanceCategory) {
    const res = await api.get("/maintenance/types", {
      params: category ? { category } : undefined,
    });
    return res.data;
  },

  async create(payload: { name: string; category: MaintenanceCategory }) {
    const res = await api.post("/maintenance/types", payload);
    return res.data;
  },

  async disable(id: string) {
    const res = await api.patch(`/maintenance/types/${id}`);
    return res.data;
  },
};
