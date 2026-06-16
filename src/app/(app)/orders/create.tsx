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
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { orderService } from "@/services/orders";
import { OrderTypeSchema } from "@/schemas/enumSchema";
import { AddInvoiceItems, OrderItemDraft } from "@/components/Addinvoiceitems";
import { PickerModal, PickerOption } from "@/components/Pickermodal";
import { createOrderFormStyles } from "@/styles/ordens.styles";
import rollback from "@/services/rollback";

const typeOptions: string[] = (OrderTypeSchema as any).options ?? [
  "Coleta",
  "Entrega",
  "Devolução",
  "Reentrega",
  "Avarias",
];

const pad = (n: number) => String(n).padStart(2, "0");
const todayBR = () => {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
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

export default function CreateOrderScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createOrderFormStyles(theme, isMobile);
  const router = useRouter();

  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [driver, setDriver] = useState<PickerOption | null>(null);
  const [vehicles, setVehicles] = useState<VehiclePick[]>([]);
  const [deliveryDate, setDeliveryDate] = useState(todayBR());
  const [scheduledStart, setScheduledStart] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItemDraft[]>([]);

  const [driverOpen, setDriverOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/status");
        const open = (Array.isArray(data) ? data : []).find(
          (s: any) => s.code === 100,
        );
        if (open) setOpenStatusId(open.id);
      } catch {
        // silencioso: validamos no submit
      }
    })();
  }, []);

  const addVehicle = (opt: PickerOption) => {
    if (vehicles.length >= 3) {
      Alert.alert("Limite", "A composição aceita no máximo 3 veículos.");
      return;
    }
    if (vehicles.some((v) => v.id === opt.id)) {
      Alert.alert("Duplicado", "Esse veículo já está na composição.");
      return;
    }
    const role: "Cavalo" | "carreta" =
      vehicles.length === 0 ? "Cavalo" : "carreta";
    setVehicles([...vehicles, { id: opt.id, label: opt.label, role }]);
  };

  const removeVehicle = (idx: number) => {
    const next = vehicles.filter((_, i) => i !== idx);
    // reatribui papéis: o primeiro sempre é o Cavalo
    setVehicles(
      next.map((v, i) => ({ ...v, role: i === 0 ? "Cavalo" : "carreta" })),
    );
  };

  const onSubmit = async () => {
    if (!openStatusId) {
      Alert.alert("Erro", "Status 'Em Aberto' (100) não encontrado.");
      return;
    }
    if (!driver) {
      Alert.alert("Atenção", "Selecione o motorista.");
      return;
    }
    if (vehicles.length === 0) {
      Alert.alert("Atenção", "Adicione ao menos um veículo (Cavalo).");
      return;
    }
    const dd = parseBR(deliveryDate);
    if (!dd) {
      Alert.alert("Atenção", "Data de entrega inválida (use DD/MM/AAAA).");
      return;
    }
    let ss: Date | null = null;
    if (scheduledStart.trim()) {
      ss = parseDateTimeBR(scheduledStart);
      if (!ss) {
        Alert.alert(
          "Atenção",
          "Início agendado inválido (use DD/MM/AAAA HH:mm).",
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await orderService.createOrder({
        status_id: openStatusId,
        driver_id: driver.id,
        delivery_date: dd.toISOString(),
        scheduled_start: ss ? ss.toISOString() : null,
        notes: notes.trim() ? notes : null,
        vehicles: vehicles.map((v, i) => ({
          vehicle_id: v.id,
          role: v.role,
          position: i + 1,
        })),
        items: items.map((it) => ({
          invoice_id: it.invoice_id,
          collection_id: it.collection_id,
          type_orders: it.type_orders,
          status_id: openStatusId,
          tracking: it.tracking?.trim() ? it.tracking : undefined,
        })),
      });
      Alert.alert("Sucesso", "Viagem emitida com sucesso!");
      router.push("/orders");
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Falha ao emitir a viagem.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.title}>Nova Viagem</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Dados gerais</Text>

          <Text style={styles.label}>Motorista</Text>
          <TouchableOpacity
            style={styles.pickerField}
            onPress={() => setDriverOpen(true)}
          >
            <Feather name="user" size={16} color={theme.textSecondary} />
            <Text style={driver ? styles.pickerText : styles.pickerPlaceholder}>
              {driver ? driver.label : "Selecionar motorista"}
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <Text style={styles.label}>Data de entrega</Text>
          <TextInput
            style={styles.input}
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Início agendado (opcional)</Text>
          <TextInput
            style={styles.input}
            value={scheduledStart}
            onChangeText={setScheduledStart}
            placeholder="DD/MM/AAAA HH:mm"
            placeholderTextColor={theme.textSecondary}
          />
          <Text style={styles.helper}>
            Ao atingir essa data/hora a viagem entra em "Em Rota"
            automaticamente.
          </Text>

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Observações da viagem (opcional)"
            placeholderTextColor={theme.textSecondary}
            multiline
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
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeVehicle(idx)}
              >
                <Feather name="trash-2" size={18} color={theme.error} />
              </TouchableOpacity>
            </View>
          ))}
          {vehicles.length < 3 && (
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
          />

          <TouchableOpacity
            style={styles.button}
            onPress={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Emitir Viagem</Text>
            )}
          </TouchableOpacity>
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
