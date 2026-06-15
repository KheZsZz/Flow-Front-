import { api } from "./api";

export interface CollectionPayload {
  client_id: string;
  address_id?: string;
  description?: string;
  scheduled_date?: string | Date;
  status_id?: string;
}

export const collectionService = {
  // availableOnly = true -> apenas coletas ainda não vinculadas a uma viagem
  async list(availableOnly = false) {
    const res = await api.get(
      `/collections${availableOnly ? "?available=true" : ""}`,
    );
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get(`/collections/${id}`);
    return res.data;
  },

  async create(payload: CollectionPayload) {
    const res = await api.post("/collections", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CollectionPayload>) {
    const res = await api.put(`/collections/${id}`, payload);
    return res.data;
  },

  async toggle(id: string, is_active: boolean) {
    const res = await api.patch(`/collections/${id}`, { is_active });
    return res.data;
  },
};
