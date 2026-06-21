import { api } from "@/services/api";

/* ─────────────────────────────────────────────────────────────────────────
 *  Tipos das RPCs de combustível (Admin-only — /dashboard/*)
 * ──────────────────────────────────────────────────────────────────────── */
export type FuelSummary = {
  total_spent: number;
  total_liters: number;
  avg_price_per_liter: number;
};

export type VehicleEfficiency = {
  vehicle_id: string;
  total_price: number;
  liters: number;
  kms_driven: number;
  km_per_liter: number;
};

type DateRange = { start_date?: string; end_date?: string };

/* ─────────────────────────────────────────────────────────────────────────
 *  Fetchers
 *  Obs.: as três primeiras só devem ser chamadas por Admin/Manager —
 *  a rota /dashboard é requireRole("Admin") no backend.
 * ──────────────────────────────────────────────────────────────────────── */
export const dashboardService = {
  async getFuelSummary(range?: DateRange): Promise<FuelSummary> {
    const { data } = await api.get("/dashboard/summary", { params: range });
    return (
      data ?? { total_spent: 0, total_liters: 0, avg_price_per_liter: 0 }
    );
  },

  async getVehicleEfficiency(): Promise<VehicleEfficiency[]> {
    const { data } = await api.get("/dashboard/efficiency");
    return Array.isArray(data) ? data : [];
  },

  async getDriverRanking(limit = 10): Promise<any[]> {
    const { data } = await api.get("/dashboard/ranking", {
      params: { limit },
    });
    return Array.isArray(data) ? data : [];
  },

  async getOrders(): Promise<any[]> {
    const { data } = await api.get("/orders");
    return Array.isArray(data) ? data : [];
  },

  async getInvoices(): Promise<any[]> {
    const { data } = await api.get("/invoices");
    return Array.isArray(data) ? data : [];
  },

  async getCollections(): Promise<any[]> {
    const { data } = await api.get("/collections");
    return Array.isArray(data) ? data : [];
  },
};

/* ─────────────────────────────────────────────────────────────────────────
 *  Helpers puros de agregação (sem dependência de React)
 *  Cuidado: joins do PostgREST vêm como { relation: {...} } (to-one) ou
 *  array (to-many). pickOne() normaliza o caso to-one.
 * ──────────────────────────────────────────────────────────────────────── */
export function pickOne<T = any>(rel: any): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export function toArray<T = any>(rel: any): T[] {
  if (!rel) return [];
  return Array.isArray(rel) ? rel : [rel];
}

export function sumBy<T>(arr: T[], fn: (x: T) => number): number {
  return arr.reduce((acc, x) => acc + (Number(fn(x)) || 0), 0);
}

export function countBy<T>(arr: T[], keyFn: (x: T) => string): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, x) => {
    const k = keyFn(x) || "—";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

export function recordToBars(rec: Record<string, number>) {
  return Object.entries(rec)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/** Filtra por created_at dentro de um intervalo ISO (limites inclusivos). */
export function withinRange(
  iso: string | null | undefined,
  start?: string,
  end?: string,
): boolean {
  if (!iso) return !start && !end ? true : false;
  const t = new Date(iso).getTime();
  if (start && t < new Date(start).getTime()) return false;
  if (end) {
    // fim do dia para incluir o dia inteiro selecionado
    const endTs = new Date(end).getTime() + 24 * 60 * 60 * 1000 - 1;
    if (t > endTs) return false;
  }
  return true;
}

/* ── Acessores de domínio (centralizam o shape vindo dos controllers) ─── */

export const orderIsFinalized = (o: any): boolean => !!o?.finaled_at;

export const orderStatusName = (o: any): string =>
  pickOne(o?.status)?.name ?? "Sem status";

export const orderDriverId = (o: any): string | null =>
  pickOne(pickOne(o?.drivers)?.users)?.id ?? null;

export const orderDriverName = (o: any): string =>
  pickOne(pickOne(o?.drivers)?.users)?.name_user ?? "—";

/** Placas da composição (cavalo + carretas), em ordem de posição. */
export const orderPlates = (o: any): string[] =>
  toArray(o?.ordervehicles)
    .slice()
    .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
    .map((ov) => pickOne(ov?.vehicles)?.license_plate)
    .filter(Boolean);

/** Itens (notas/coletas) anexados à viagem. */
export const orderItems = (o: any): any[] =>
  toArray(o?.order_add_itens)
    .map((wrap) => pickOne(wrap?.orderitem))
    .filter(Boolean);

/* ── Notas fiscais ─────────────────────────────────────────────────────── */
export type InvoiceSituation = "Finalizada" | "Aguardando comprovante" | "Pendente";

export const invoiceSituation = (inv: any): InvoiceSituation => {
  if (inv?.delivery_status === "finalizada") return "Finalizada";
  if (inv?.delivery_status === "aguardando_comprovante")
    return "Aguardando comprovante";
  return "Pendente";
};

export const invoiceValue = (inv: any): number =>
  Number(inv?.value_nfe ?? 0) || 0;

/* ── Coletas ───────────────────────────────────────────────────────────── */
export const collectionStatusName = (c: any): string =>
  pickOne(c?.status)?.name ?? "Sem status";

export const collectionIsFinalized = (c: any): boolean => !!c?.finaled_at;

/* ── Formatação ────────────────────────────────────────────────────────── */
export const formatBRL = (n: number): string =>
  (Number(n) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const formatNumber = (n: number, digits = 0): string =>
  (Number(n) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
