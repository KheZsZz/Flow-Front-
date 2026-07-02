import { api } from "@/services/api";

export interface FuelPayload {
  vehicle_id: string;
  gas_station_name: string;
  fuel_type: string;
  liters: number;
  total_price: number;
  current_odometer: number;
  is_full_tank?: boolean;
  date_fuel?: string | Date;
}

export const fuelService = {
  // usado na tela /fuel (Requestor+) e também no lançamento do Driver dentro de /driver
  async create(payload: FuelPayload) {
    const res = await api.post("/fuel", payload);
    return res.data;
  },

  // listagem — só a tela /fuel usa (backend já barra Driver com requireRole("Requestor"))
  async list() {
    const res = await api.get("/fuel");
    return res.data;
  },

  async findByPlate(plate: string) {
    const res = await api.get(`/fuel/plate/${plate}`);
    return res.data;
  },

  async update(id: string, payload: Partial<FuelPayload>) {
    const res = await api.put(`/fuel/${id}`, payload);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete(`/fuel/${id}`);
    return res.data;
  },
};
