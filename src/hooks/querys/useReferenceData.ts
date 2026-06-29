import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export const referenceKeys = {
  clients: ["clients"] as const,
  drivers: ["drivers"] as const,
  vehicles: ["vehicles"] as const,
  status: ["status"] as const,
};

type QueryOpts = { enabled?: boolean };

async function fetchList<T = any>(path: string): Promise<T[]> {
  const { data } = await api.get(path);
  return Array.isArray(data) ? data : [];
}

export function useClients(options?: QueryOpts) {
  return useQuery({
    queryKey: referenceKeys.clients,
    queryFn: () => fetchList("/clients"),
    enabled: options?.enabled ?? true,
  });
}

export function useDrivers(options?: QueryOpts) {
  return useQuery({
    queryKey: referenceKeys.drivers,
    queryFn: () => fetchList("/drivers"),
    enabled: options?.enabled ?? true,
  });
}

export function useVehicles(options?: QueryOpts) {
  return useQuery({
    queryKey: referenceKeys.vehicles,
    queryFn: () => fetchList("/vehicles"),
    enabled: options?.enabled ?? true,
  });
}

export function useStatus(options?: QueryOpts) {
  return useQuery({
    queryKey: referenceKeys.status,
    queryFn: () => fetchList("/status"),
    enabled: options?.enabled ?? true,
  });
}
