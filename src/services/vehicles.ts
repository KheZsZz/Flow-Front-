import { api } from "@/services/api";

export const vehiclesService = {
  async list() {
    const res = await api.get("/vehicles");
    return res.data;
  },

  async findByPlate(plate: string) {
    const res = await api.get(`/vehicles/plate/${plate}`);
    return res.data;
  },
};
