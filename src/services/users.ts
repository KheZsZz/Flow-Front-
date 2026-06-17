import { api } from "./api";

export interface DriverFields {
  cnh?: string;
  validade_cnh?: string;
  categoria_cnh?: string;
  mopp?: boolean;
  moop_validade?: string | null;
}

export interface CreateUserPayload extends DriverFields {
  name_user: string;
  email_user: string;
  password_user: string;
  phone_user: string;
  profile_user?: string;
  created_by?: string;
}

export interface UpdateUserPayload extends DriverFields {
  name_user?: string;
  email_user?: string;
  phone_user?: string;
  profile_user?: string;
  is_active?: boolean;
}

export const usersService = {
  async list() {
    const res = await api.get("/users");
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: string) {
    const res = await api.get(`/users/${id}`);
    return Array.isArray(res.data) ? res.data[0] : res.data;
  },

  async create(payload: CreateUserPayload) {
    const res = await api.post("/users", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateUserPayload) {
    const res = await api.put(`/users/${id}`, payload);
    return res.data;
  },

  async toggleActive(id: string, is_active: boolean) {
    const res = await api.patch(`/users/${id}`, { is_active });
    return res.data;
  },

  async listDrivers(opts: { activeOnly?: boolean } = {}) {
    const { activeOnly = false } = opts;
    const res = await api.get("/drivers");
    const arr = Array.isArray(res.data) ? res.data : [];
    return activeOnly ? arr.filter((d: any) => d.is_active) : arr;
  },

  driverOptions(drivers: any[], opts: { activeOnly?: boolean } = {}) {
    const { activeOnly = true } = opts;
    return drivers
      .filter((d: any) => (activeOnly ? d.is_active : true))
      .map((driver: any) => {
        const drv = Array.isArray(driver.drivers)
          ? driver.drivers[0]
          : driver.drivers;
        return {
          label: driver.name_user ?? driver.users?.name_user ?? "Motorista",
          value: drv?.id ?? "",
        };
      })
      .filter((o: any) => o.value);
  },
};
