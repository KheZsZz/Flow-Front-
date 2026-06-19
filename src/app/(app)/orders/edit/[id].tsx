import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { orderService, STATUS_CODE } from "@/services/orders";
import { OrderTypeSchema } from "@/schemas/enumSchema";
import { ControlledInput } from "@/components/controllerInput";
import { AddInvoiceItems, OrderItemDraft } from "@/components/addInvoiceItems";
import { createOrdersListStyles } from "@/styles/orders.styles";
import { Loadding } from "@/components/loadding";
import rollback from "@/services/rollback";
import { usersService } from "@/services/users";

const typeOptions: string[] = (OrderTypeSchema as any).options ?? [];

interface EditForm {
  driver_id: string;
  vehicle1: string;
  vehicle2: string;
  vehicle3: string;
  delivery_date: string;
  scheduled_start: string;
  notes: string;
}

export default function EditOrderScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createOrdersListStyles(theme, isMobile);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  const [finalized, setFinalized] = useState(false);
  const [started, setStarted] = useState(false);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [items, setItems] = useState<OrderItemDraft[]>([]);

  const [loadedDriverName, setLoadedDriverName] = useState("");
  const [loadedVehicles, setLoadedVehicles] = useState<
    { label: string; role: string }[]
  >([]);

  const [initialDriverId, setInitialDriverId] = useState("");
  const [initialVehicleIds, setInitialVehicleIds] = useState<string[]>([]);
  const [initialItemIds, setInitialItemIds] = useState<string[]>([]);

  const { control, handleSubmit, watch, setValue, reset } = useForm<EditForm>({
    defaultValues: {
      driver_id: "",
      vehicle1: "",
      vehicle2: "",
      vehicle3: "",
      delivery_date: "",
      scheduled_start: "",
      notes: "",
    },
  });

  const vehicle1 = watch("vehicle1");
  const vehicle2 = watch("vehicle2");
  const v1 = vehicles.find((v) => v.id === vehicle1);
  const pullsTrailers = v1?.type === "Cavalo";

  const editableHeader = !finalized;
  const editableFleet = !finalized && !started;

  const load = async () => {
    try {
      const [order, statusRes, drvRes, vehRes] = await Promise.all([
        orderService.getOrderById(id),
        api.get("/status"),
        api.get("/drivers"),
        api.get("/vehicles"),
      ]);

      const open = (Array.isArray(statusRes.data) ? statusRes.data : []).find(
        (s: any) => s.code === 100,
      );
      if (open) setOpenStatusId(open.id);
      setDrivers(Array.isArray(drvRes.data) ? drvRes.data : []);
      setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);

      const code = order.status?.code;
      setFinalized(!!order.finaled_at || code === STATUS_CODE.CONCLUIDO);
      setStarted(code !== STATUS_CODE.EM_ABERTO);

      const dId = order.drivers?.id ?? order.driver_id ?? "";
      setInitialDriverId(dId);
      setLoadedDriverName(
        order.drivers?.users?.name_user ?? order.drivers?.name_user ?? "—",
      );

      const ovs = (order.ordervehicles ?? []).sort(
        (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
      );
      const vIds: string[] = ovs
        .map((ov: any) => ov.vehicles?.id)
        .filter(Boolean);
      setInitialVehicleIds(vIds);
      setLoadedVehicles(
        ovs.map((ov: any) => ({
          label: ov.vehicles?.license_plate ?? "Veículo",
          role: ov.role ?? "Cavalo",
        })),
      );

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
            locked: oi.status?.code === STATUS_CODE.CONCLUIDO,
          } as OrderItemDraft;
        });
      setItems(existing);
      setInitialItemIds(existing.map((i) => i.orderItemId!).filter(Boolean));

      reset({
        driver_id: dId,
        vehicle1: vIds[0] ?? "",
        vehicle2: vIds[1] ?? "",
        vehicle3: vIds[2] ?? "",
        delivery_date: order.delivery_date ?? "",
        scheduled_start: order.scheduled_start ?? "",
        notes: order.notes ?? "",
      });
    } catch {
      rollback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const driverOptions = useMemo(
    () => usersService.driverOptions(drivers),
    [drivers],
  );
  const carretaOptions = useMemo(
    () =>
      vehicles
        .filter((v: any) => v.is_active && v.type === "Carreta")
        .map((v: any) => ({
          label: `${v.license_plate} · ${v.type}`,
          value: v.id,
        })),
    [vehicles],
  );
  const v1Options = useMemo(
    () =>
      vehicles
        .filter((v: any) => v.is_active && v.type !== "Carreta")
        .map((v: any) => ({
          label: `${v.license_plate} · ${v.type}`,
          value: v.id,
        })),
    [vehicles],
  );
  const v3Options = useMemo(
    () => carretaOptions.filter((o) => o.value !== vehicle2),
    [carretaOptions, vehicle2],
  );

  useEffect(() => {
    if (editableFleet && !pullsTrailers) {
      setValue("vehicle2", "");
      setValue("vehicle3", "");
    }
  }, [pullsTrailers, editableFleet]);

  const onSubmit = async (data: EditForm) => {
    const payload: any = { notes: data.notes };
    if (data.delivery_date) payload.delivery_date = data.delivery_date;
    payload.scheduled_start = data.scheduled_start || null;

    if (editableFleet) {
      if (data.driver_id && data.driver_id !== initialDriverId)
        payload.driver_id = data.driver_id;

      const current = [data.vehicle1, data.vehicle2, data.vehicle3].filter(
        Boolean,
      );
      const changed =
        current.length !== initialVehicleIds.length ||
        current.some((cid, i) => cid !== initialVehicleIds[i]);
      if (changed) {
        payload.vehicles = current.map((vid, i) => ({
          vehicle_id: vid,
          role: i === 0 ? "Cavalo" : "carreta",
          position: i + 1,
        }));
      }
    }

    const newItems = items.filter((i) => !i.existing);
    if (newItems.length > 0) {
      if (!openStatusId)
        return Alert.alert("Erro", "Status 'Em Aberto' (100) não encontrado.");
      payload.add_items = newItems.map((it) => ({
        invoice_id: it.invoice_id,
        collection_id: it.collection_id,
        type_orders: it.type_orders,
        status_id: openStatusId,
      }));
    }
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
          } catch (e: any) {}
        },
      },
    ]);
  };

  if (loading) return <Loadding />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather name="chevron-left" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Viagem</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
      >
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
                Viagem iniciada — motorista e veículos não podem ser alterados;
                notas concluídas não podem ser removidas.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Dados gerais</Text>

          {editableFleet ? (
            <ControlledInput
              control={control}
              name="driver_id"
              label="Motorista"
              variant="select"
              iconName="user"
              options={driverOptions}
            />
          ) : (
            <>
              <Text style={styles.label}>Motorista</Text>
              <View style={styles.readonlyField}>
                <Text style={styles.readonlyValue}>{loadedDriverName}</Text>
              </View>
            </>
          )}

          <ControlledInput
            control={control}
            name="delivery_date"
            label="Data de entrega"
            variant="date"
            iconName="calendar"
          />
          <ControlledInput
            control={control}
            name="scheduled_start"
            label="Início agendado"
            variant="date"
            iconName="clock"
          />
          <ControlledInput
            control={control}
            name="notes"
            label="Observações"
            placeholder="Observações da viagem"
            iconName="note-sticky"
            multiline
          />

          <Text style={styles.sectionTitle}>Composição de veículos</Text>
          {editableFleet ? (
            <>
              <ControlledInput
                control={control}
                name="vehicle1"
                label="Veículo principal (líder)"
                variant="select"
                iconName="truck"
                options={v1Options}
              />
              {pullsTrailers && (
                <>
                  <ControlledInput
                    control={control}
                    name="vehicle2"
                    label="Carreta (2ª placa)"
                    variant="select"
                    iconName="trailer"
                    options={carretaOptions}
                  />
                  {!!vehicle2 && (
                    <ControlledInput
                      control={control}
                      name="vehicle3"
                      label="Carreta (3ª placa)"
                      variant="select"
                      iconName="trailer"
                      options={v3Options}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            loadedVehicles.map((v, i) => (
              <View key={i} style={styles.readonlyField}>
                <Text style={styles.readonlyValue}>
                  {v.label} · {v.role}
                </Text>
              </View>
            ))
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
              onPress={handleSubmit(onSubmit)}
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
    </View>
  );
}
