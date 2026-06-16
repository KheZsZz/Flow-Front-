import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { orderService, STATUS_CODE } from "@/services/orders";
import { OrderTypeSchema } from "@/schemas/enumSchema";
import { AddInvoiceItems, OrderItemDraft } from "@/components/Addinvoiceitems";
import { PickerModal, PickerOption } from "@/components/Pickermodal";
import { createOrderFormStyles } from "@/styles/ordens.styles";
import { Loadding } from "@/components/loadding";
import rollback from "@/services/rollback";

const typeOptions: string[] = (OrderTypeSchema as any).options ?? [
  "Coleta",
  "Entrega",
  "Devolução",
  "Reentrega",
  "Avarias",
];

const pad = (n: number) => String(n).padStart(2, "0");
const fmtBR = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const fmtDateTimeBR = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};
function parseBR(s: string): Date | null {
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return isNaN(d.getTime()) ? null : d;
}
function parseDateTimeBR(s: string): Date | null {
  const m = s
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
  if (!m) return null;
  const d = new Date(
    +m[3],
    +m[2] - 1,
    +m[1],
    m[4] ? +m[4] : 0,
    m[5] ? +m[5] : 0,
  );
  return isNaN(d.getTime()) ? null : d;
}

interface VehiclePick {
  id: string;
  label: string;
  role: "Cavalo" | "carreta";
}

export default function EditOrderScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createOrderFormStyles(theme, isMobile);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  const [statusCode, setStatusCode] = useState<number | undefined>();
  const [finalized, setFinalized] = useState(false);
  const [started, setStarted] = useState(false);

  const [driver, setDriver] = useState<PickerOption | null>(null);
  const [vehicles, setVehicles] = useState<VehiclePick[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItemDraft[]>([]);

  // snapshots iniciais p/ detectar mudanças e remoções
  const [initialDriverId, setInitialDriverId] = useState<string | null>(null);
  const [initialVehicleIds, setInitialVehicleIds] = useState<string[]>([]);
  const [initialItemIds, setInitialItemIds] = useState<string[]>([]);

  const [driverOpen, setDriverOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const load = async () => {
    try {
      const [order, statusRes] = await Promise.all([
        orderService.getOrderById(id),
        api.get("/status"),
      ]);

      const open = (Array.isArray(statusRes.data) ? statusRes.data : []).find(
        (s: any) => s.code === 100,
      );
      if (open) setOpenStatusId(open.id);

      const code = order.status?.code;
      setStatusCode(code);
      const isFin = !!order.finaled_at || code === STATUS_CODE.CONCLUIDO;
      setFinalized(isFin);
      setStarted(code !== STATUS_CODE.EM_ABERTO);

      // motorista
      const dId = order.drivers?.id ?? order.driver_id ?? null;
      const dName =
        order.drivers?.users?.name_user ??
        order.drivers?.name_user ??
        "Motorista";
      if (dId) setDriver({ id: dId, label: dName });
      setInitialDriverId(dId);

      // veículos
      const vlist: VehiclePick[] = (order.ordervehicles ?? [])
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .map((ov: any) => ({
          id: ov.vehicles?.id,
          label: ov.vehicles?.license_plate ?? "Veículo",
          role: (ov.role as "Cavalo" | "carreta") ?? "Cavalo",
        }))
        .filter((v: VehiclePick) => !!v.id);
      setVehicles(vlist);
      setInitialVehicleIds(vlist.map((v) => v.id));

      setDeliveryDate(fmtBR(order.delivery_date));
      setScheduledStart(fmtDateTimeBR(order.scheduled_start));
      setNotes(order.notes ?? "");

      // itens existentes
      const existing: OrderItemDraft[] = (order.order_add_itens ?? [])
        .map((l: any) => l.orderitem)
        .filter(Boolean)
        .map((oi: any) => {
          const isInvoice = !!oi.invoices;
          return {
            key: oi.id,
            orderItemId: oi.id,
            existing: true,
            invoice_id: oi.invoices
              ? (oi.invoice_id ?? oi.invoices.id)
              : undefined,
            collection_id: oi.collections
              ? (oi.collection_id ?? oi.collections.id)
              : undefined,
            label: isInvoice
              ? `NFe ${oi.invoices?.nfe ?? "—"}`
              : (oi.collections?.code ?? "Coleta"),
            sublabel: isInvoice
              ? oi.invoices?.value_nfe != null
                ? `R$ ${oi.invoices.value_nfe}`
                : undefined
              : oi.collections?.clients?.name_client,
            type_orders: oi.type_orders ?? typeOptions[0],
            tracking: oi.tracking ?? "",
            locked: oi.status?.code === STATUS_CODE.CONCLUIDO,
          } as OrderItemDraft;
        });
      setItems(existing);
      setInitialItemIds(existing.map((i) => i.orderItemId!).filter(Boolean));
    } catch {
      Alert.alert("Erro", "Viagem não encontrada.");
      rollback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addVehicle = (opt: PickerOption) => {
    if (vehicles.length >= 3) {
      Alert.alert("Limite", "A composição aceita no máximo 3 veículos.");
      return;
    }
    if (vehicles.some((v) => v.id === opt.id)) return;
    const role: "Cavalo" | "carreta" =
      vehicles.length === 0 ? "Cavalo" : "carreta";
    setVehicles([...vehicles, { id: opt.id, label: opt.label, role }]);
  };

  const removeVehicle = (idx: number) => {
    const next = vehicles.filter((_, i) => i !== idx);
    setVehicles(
      next.map((v, i) => ({ ...v, role: i === 0 ? "Cavalo" : "carreta" })),
    );
  };

  const onSubmit = async () => {
    const dd = parseBR(deliveryDate);
    if (deliveryDate.trim() && !dd) {
      Alert.alert("Atenção", "Data de entrega inválida (DD/MM/AAAA).");
      return;
    }
    let ss: Date | null | undefined = undefined;
    if (scheduledStart.trim()) {
      const parsed = parseDateTimeBR(scheduledStart);
      if (!parsed) {
        Alert.alert("Atenção", "Início agendado inválido (DD/MM/AAAA HH:mm).");
        return;
      }
      ss = parsed;
    }

    const payload: any = {
      notes: notes,
    };
    if (dd) payload.delivery_date = dd.toISOString();
    if (ss !== undefined)
      payload.scheduled_start = ss ? ss.toISOString() : null;

    // motorista/veículos só se a viagem ainda não foi iniciada
    if (!started) {
      if (driver && driver.id !== initialDriverId)
        payload.driver_id = driver.id;

      const currentVehicleIds = vehicles.map((v) => v.id);
      const changed =
        currentVehicleIds.length !== initialVehicleIds.length ||
        currentVehicleIds.some((cid, i) => cid !== initialVehicleIds[i]);
      if (changed) {
        payload.vehicles = vehicles.map((v, i) => ({
          vehicle_id: v.id,
          role: v.role,
          position: i + 1,
        }));
      }
    }

    // itens novos -> add_items
    const newItems = items.filter((i) => !i.existing);
    if (newItems.length > 0) {
      if (!openStatusId) {
        Alert.alert("Erro", "Status 'Em Aberto' (100) não encontrado.");
        return;
      }
      payload.add_items = newItems.map((it) => ({
        invoice_id: it.invoice_id,
        collection_id: it.collection_id,
        type_orders: it.type_orders,
        status_id: openStatusId,
        tracking: it.tracking?.trim() ? it.tracking : undefined,
      }));
    }

    // itens existentes removidos -> remove_item_ids
    const currentExistingIds = items
      .filter((i) => i.existing)
      .map((i) => i.orderItemId!);
    const removed = initialItemIds.filter(
      (oid) => !currentExistingIds.includes(oid),
    );
    if (removed.length > 0) payload.remove_item_ids = removed;

    setSubmitting(true);
    try {
      await orderService.updateOrder(id, payload);
      Alert.alert("Sucesso", "Viagem atualizada com sucesso!");
      router.push("/orders");
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Não foi possível atualizar a viagem.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Excluir viagem", "Deseja realmente excluir esta viagem?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await orderService.deleteOrder(id);
            Alert.alert("Pronto", "Viagem excluída.");
            router.push("/orders");
          } catch (e: any) {
            Alert.alert(
              "Erro",
              e?.response?.data?.error || "Não foi possível excluir.",
            );
          }
        },
      },
    ]);
  };

  if (loading) return <Loadding />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather
            name="arrow-left"
            size={22}
            color={theme.isDark ? theme.textSecondary : theme.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Viagem</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          {finalized && (
            <View style={styles.lockedBanner}>
              <Text style={styles.lockedText}>
                Viagem finalizada — não pode ser alterada.
              </Text>
            </View>
          )}
          {!finalized && started && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                Viagem iniciada — motorista e veículos não podem ser alterados.
                Notas já concluídas não podem ser removidas.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Dados gerais</Text>

          <Text style={styles.label}>Motorista</Text>
          <TouchableOpacity
            style={[
              styles.pickerField,
              (finalized || started) && { opacity: 0.5 },
            ]}
            onPress={() => !finalized && !started && setDriverOpen(true)}
            disabled={finalized || started}
          >
            <Feather name="user" size={16} color={theme.textSecondary} />
            <Text style={driver ? styles.pickerText : styles.pickerPlaceholder}>
              {driver ? driver.label : "Selecionar motorista"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Data de entrega</Text>
          <TextInput
            style={[styles.input, finalized && { opacity: 0.5 }]}
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            editable={!finalized}
          />

          <Text style={styles.label}>Início agendado</Text>
          <TextInput
            style={[styles.input, finalized && { opacity: 0.5 }]}
            value={scheduledStart}
            onChangeText={setScheduledStart}
            placeholder="DD/MM/AAAA HH:mm"
            placeholderTextColor={theme.textSecondary}
            editable={!finalized}
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              finalized && { opacity: 0.5 },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Observações da viagem"
            placeholderTextColor={theme.textSecondary}
            multiline
            editable={!finalized}
          />

          <Text style={styles.sectionTitle}>Composição de veículos</Text>
          {vehicles.map((v, idx) => (
            <View key={v.id} style={styles.vehicleCard}>
              <Feather name="truck" size={18} color={theme.textSecondary} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehiclePlate}>{v.label}</Text>
                <Text style={styles.vehicleRole}>
                  {v.role} · posição {idx + 1}
                </Text>
              </View>
              {!finalized && !started && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeVehicle(idx)}
                >
                  <Feather name="trash-2" size={18} color={theme.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {!finalized && !started && vehicles.length < 3 && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setVehicleOpen(true)}
            >
              <Feather
                name="plus"
                size={16}
                color={theme.isDark ? theme.link : theme.primary}
              />
              <Text style={styles.addBtnText}>
                {vehicles.length === 0
                  ? "Adicionar Cavalo"
                  : "Adicionar carreta"}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>Itens da viagem</Text>
          <AddInvoiceItems
            items={items}
            onChange={setItems}
            typeOptions={typeOptions}
            disabled={finalized}
          />

          {!finalized && (
            <TouchableOpacity
              style={styles.button}
              onPress={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          )}

          {!finalized && (
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Feather name="trash-2" size={16} color="#fff" />
              <Text style={styles.deleteBtnText}>Excluir viagem</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <PickerModal
        visible={driverOpen}
        title="Selecionar motorista"
        onClose={() => setDriverOpen(false)}
        onSelect={setDriver}
        load={async () => {
          const { data } = await api.get("/drivers");
          return (Array.isArray(data) ? data : []).map((d: any) => ({
            id: d.id,
            label: d.users?.name_user ?? d.name_user ?? d.name ?? "Motorista",
            sublabel: d.license_number ?? d.category ?? undefined,
            raw: d,
          }));
        }}
      />

      <PickerModal
        visible={vehicleOpen}
        title="Selecionar veículo"
        onClose={() => setVehicleOpen(false)}
        onSelect={addVehicle}
        load={async () => {
          const { data } = await api.get("/vehicles");
          return (Array.isArray(data) ? data : []).map((v: any) => ({
            id: v.id,
            label: v.license_plate ?? "Veículo",
            sublabel: `${v.make ?? ""} ${v.model ?? ""}`.trim() || undefined,
            raw: v,
          }));
        }}
      />
    </View>
  );
}
