import { api } from "@/services/api";

export interface MaintenancePayload {
  vehicle_id: string;
  maintenance_type: string;
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
