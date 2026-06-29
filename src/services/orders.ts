import { api } from "./api";

export interface OrderVehicleInput {
  vehicle_id: string;
  role: "Cavalo" | "carreta";
  position: number;
}

export interface OrderItemInput {
  invoice_id?: string;
  collection_id?: string;
  type_orders: string;
  status_id: string;
}

export interface CreateOrderPayload {
  status_id: string;
  driver_id: string;
  delivery_date: string; // ISO
  scheduled_start?: string | null; // ISO
  notes?: string | null;
  vehicles: OrderVehicleInput[];
  items: OrderItemInput[];
}

export interface UpdateOrderPayload {
  driver_id?: string;
  notes?: string;
  delivery_date?: string;
  scheduled_start?: string | null;
  vehicles?: OrderVehicleInput[];
  add_items?: OrderItemInput[];
  remove_item_ids?: string[];
}

/* ── Códigos de status (etapas do ciclo da viagem) ───────────────────── */
export const STATUS_CODE = {
  EM_ABERTO: 100,
  FINALIZADO: 101,
  CONCLUIDO: 102,
  EM_ROTA: 110,
  CHEGADA_CLIENTE: 111,
  ENTREGA_REALIZADA: 112,
  COLETA_REALIZADA: 113,
  AGUARDANDO_CANHOTO: 200,
  CANCELADO: 103,
} as const;
export const isFinalized = (order: any) =>
  !!order?.finaled_at || order?.status?.code === STATUS_CODE.CONCLUIDO;

export const isStarted = (order: any) =>
  order?.status?.code !== undefined &&
  order.status.code !== STATUS_CODE.EM_ABERTO;

export function nextDriverStage(
  item: any,
): { code: number; label: string } | null {
  const code = item?.status?.code;
  const isColeta = !!item?.collections || !!item?.collection_id;

  if (code === STATUS_CODE.EM_ROTA) {
    return { code: STATUS_CODE.CHEGADA_CLIENTE, label: "Chegada no Cliente" };
  }
  if (code === STATUS_CODE.CHEGADA_CLIENTE) {
    return isColeta
      ? { code: STATUS_CODE.COLETA_REALIZADA, label: "Coleta Realizada" }
      : { code: STATUS_CODE.ENTREGA_REALIZADA, label: "Entrega Realizada" };
  }
  return null; // 100 (aguarda Em Rota automático) ou já em 112/113/200/102
}

/* ── Service ─────────────────────────────────────────────────────────── */
export const orderService = {
  async getOrders() {
    const res = await api.get("/orders");
    return res.data;
  },

  async getOrderById(id: string) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async createOrder(payload: CreateOrderPayload) {
    const res = await api.post("/orders", payload);
    return res.data;
  },

  async updateOrder(id: string, payload: UpdateOrderPayload) {
    const res = await api.put(`/orders/${id}`, payload);
    return res.data;
  },

  async deleteOrder(id: string) {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },

  async updateStatus(id: string, status_id: string) {
    const res = await api.patch(`/orders/${id}/status`, { status_id });
    return res.data;
  },

  // baixa (conclui) os itens selecionados; quando todos concluem,
  // o backend finaliza a viagem automaticamente.
  async baixar(id: string, item_ids: string[]) {
    const res = await api.post(`/orders/${id}/baixar`, { item_ids });
    return res.data;
  },

  // busca de nota para incluir como item
  async findInvoiceByNfe(nfe: string) {
    const res = await api.get(`/invoices/nfe/${nfe}`);
    return res.data;
  },

  async findInvoiceByBarcode(barcode: string) {
    const res = await api.get(`/invoices/barcode/${barcode}`);
    return res.data;
  },
};
