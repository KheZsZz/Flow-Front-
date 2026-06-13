import { api } from "./api";

export interface OrderVehicleInput {
  vehicle_id: string;
  role?: "Cavalo" | "carreta";
  position?: number;
}

export interface OrderItemInput {
  invoice_id?: string;
  collection_id?: string;
  type_orders: string;
  status_id: string;
  tracking?: string;
}

export interface CreateOrderPayload {
  status_id: string;
  driver_id: string;
  delivery_date: string | Date;
  scheduled_start?: string | Date | null;
  notes?: string | null;
  vehicles: OrderVehicleInput[];
  items?: OrderItemInput[];
}

export interface UpdateOrderPayload {
  driver_id?: string;
  notes?: string;
  delivery_date?: string | Date;
  scheduled_start?: string | Date;
  vehicles?: OrderVehicleInput[];
  add_items?: OrderItemInput[];
  remove_item_ids?: string[];
}

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

  async updateStatus(id: string, status_id: string) {
    const res = await api.patch(`/orders/${id}/status`, { status_id });
    return res.data;
  },

  // baixa: conclui as invoices indicadas; o backend encerra a viagem
  // quando todas estiverem concluídas.
  async baixar(id: string, item_ids: string[]) {
    const res = await api.post(`/orders/${id}/baixar`, { item_ids });
    return res.data;
  },

  async deleteOrder(id: string) {
    await api.delete(`/orders/${id}`);
  },

  // busca de nota para vincular na ordem
  async findInvoiceByNfe(nfe: string) {
    const res = await api.get(`/invoices/nfe/${nfe}`);
    return res.data;
  },
  async findInvoiceByBarcode(barcode: string) {
    const res = await api.get(`/invoices/barcode/${barcode}`);
    return res.data;
  },
};

// ----- status helpers (códigos definidos no banco) -----
export const STATUS_CODE = {
  EM_ABERTO: 100,
  EM_ANDAMENTO: 101,
  CONCLUIDO: 102,
  CANCELADO: 103,
  EM_ROTA: 110,
  AGUARDANDO_CANHOTO: 200,
  CANHOTO_RECEBIDO: 201,
} as const;

export function statusColor(code?: number): string {
  switch (code) {
    case STATUS_CODE.EM_ABERTO:
      return "#1565C0"; // azul
    case STATUS_CODE.EM_ROTA:
    case STATUS_CODE.EM_ANDAMENTO:
      return "#EF6C00"; // laranja
    case STATUS_CODE.CONCLUIDO:
    case STATUS_CODE.CANHOTO_RECEBIDO:
      return "#2E7D32"; // verde
    case STATUS_CODE.CANCELADO:
      return "#C62828"; // vermelho
    case STATUS_CODE.AGUARDANDO_CANHOTO:
      return "#6A1B9A"; // roxo
    default:
      return "#616161";
  }
}

export const isFinalized = (order: any): boolean =>
  !!order?.finaled_at || order?.status?.code === STATUS_CODE.CONCLUIDO;

export const isStarted = (order: any): boolean =>
  order?.status?.code !== STATUS_CODE.EM_ABERTO;
