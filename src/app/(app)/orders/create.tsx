import React, { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { orderService } from "@/services/orders";
import { OrderTypeSchema } from "@/schemas/enumSchema";
import { ControlledInput } from "@/components/controllerInput";
import { AddInvoiceItems, OrderItemDraft } from "@/components/addInvoiceItems";
import { createOrdersListStyles } from "@/styles/orders.styles";
import rollback from "@/services/rollback";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Button } from "@/components/button";

const typeOptions: string[] = (OrderTypeSchema as any).options ?? [];

interface CreateForm {
  type_orders: string;
  driver_id: string;
  vehicle1: string;
  vehicle2: string;
  vehicle3: string;
  delivery_date: string;
  scheduled_start: string;
  notes: string;
}

export default function CreateOrderScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createOrdersListStyles(theme, isMobile);
  const router = useRouter();

  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateForm>({
    defaultValues: {
      driver_id: "",
      vehicle1: "",
      vehicle2: "",
      vehicle3: "",
      delivery_date: "",
      scheduled_start: "",
      notes: "",
      type_orders: typeOptions[0],
    },
  });

  const vehicle1 = watch("vehicle1");
  const vehicle2 = watch("vehicle2");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/status");
        const open = (Array.isArray(data) ? data : []).find(
          (s: any) => s.code === 100,
        );
        if (open) setOpenStatusId(open.id);
      } catch {}
      try {
        const { data } = await api.get("/drivers");
        setDrivers(Array.isArray(data) ? data : []);
      } catch {
        /* */
      }
      try {
        const { data } = await api.get("/vehicles");
        setVehicles(Array.isArray(data) ? data : []);
      } catch {
        /* */
      }
    })();
  }, []);

  const driverOptions = useMemo(
    () =>
      drivers
        .map((driver: any) => {
          const drv = Array.isArray(driver.drivers)
            ? driver.drivers[0]
            : driver.drivers;
          return {
            label: driver.name_user ?? driver.users?.name_user ?? "Motorista",
            value: drv?.id ?? "", // Drivers.id — FK de orders.driver_id
          };
        })
        .filter((o: any) => o.value),
    [drivers],
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
  const v1 = vehicles.find((v) => v.id === vehicle1);
  const pullsTrailers = v1?.type === "Cavalo";
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
  const v3Options = useMemo(
    () => carretaOptions.filter((o) => o.value !== vehicle2),
    [carretaOptions, vehicle2],
  );
  const [selectedOrderType, setSelectedOrderType] = useState(typeOptions[0]);

  useEffect(() => {
    if (!pullsTrailers) {
      setValue("vehicle2", "");
      setValue("vehicle3", "");
    }
  }, [pullsTrailers]);

  const onSubmit = async (data: CreateForm) => {
    if (!openStatusId) {
      Alert.alert("Erro", "Status 'Em Aberto' (100) não encontrado.");
      return;
    }
    if (!data.driver_id)
      return Alert.alert("Atenção", "Selecione o motorista.");
    if (!data.vehicle1)
      return Alert.alert("Atenção", "Selecione o veículo principal.");
    if (!data.delivery_date)
      return Alert.alert("Atenção", "Informe a data de entrega.");

    const composed = [data.vehicle1, data.vehicle2, data.vehicle3].filter(
      Boolean,
    );

    setSubmitting(true);
    try {
      await orderService.createOrder({
        status_id: openStatusId,
        driver_id: data.driver_id,
        delivery_date: data.delivery_date,
        scheduled_start: data.scheduled_start || null,
        notes: data.notes?.trim() ? data.notes : null,
        vehicles: composed.map((vid, i) => ({
          vehicle_id: vid,
          role: i === 0 ? "Cavalo" : "carreta",
          position: i + 1,
        })),
        items: items.map((it) => ({
          invoice_id: it.invoice_id,
          collection_id: it.collection_id,
          type_orders: it.type_orders || data.type_orders,
          status_id: openStatusId,
        })),
      });
      Alert.alert("Sucesso", "Viagem emitida com sucesso!");
      router.push("/orders");
    } catch (e: any) {
      console.log("createOrder error:", e?.response?.data ?? e?.message ?? e);
      Alert.alert(
        "Erro",
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Não foi possível emitir a viagem.",
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
        <Text style={styles.title}>Ordem de Serviço</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Dados gerais</Text>

          <View style={styles.chip}>
            <ControlledInput
              control={control}
              name="type_orders"
              label="Tipo de ordem"
              variant="select"
              options={[
                { value: typeOptions[0], label: typeOptions[0] },
                { value: typeOptions[1], label: typeOptions[1] },
                { value: typeOptions[2], label: typeOptions[2] },
                { value: typeOptions[3], label: typeOptions[3] },
              ]}
            />
          </View>

          <View style={styles.formList}>
            <View style={styles.formListItem}>
              <ControlledInput
                control={control}
                name="driver_id"
                label="Motorista"
                variant="dropDownList"
                options={driverOptions}
              />
            </View>

            <View style={styles.formListItem}>
              <ControlledInput
                control={control}
                name="delivery_date"
                label="Data de entrega"
                variant="date"
                iconName="calendar"
              />
            </View>
          </View>
          <View style={styles.formList}>
            <View style={styles.formListItem}>
              <ControlledInput
                control={control}
                name="vehicle1"
                label="Veículo principal (líder)"
                variant="dropDownList"
                iconName="truck"
                options={v1Options}
              />
            </View>
            {pullsTrailers && (
              <>
                <View style={styles.formListItem}>
                  <ControlledInput
                    control={control}
                    name="vehicle2"
                    label="Carreta (2ª placa)"
                    variant="dropDownList"
                    iconName="trailer"
                    options={carretaOptions}
                  />
                </View>
                {!!vehicle2 && (
                  <View style={styles.formListItem}>
                    <ControlledInput
                      control={control}
                      name="vehicle3"
                      label="Carreta (3ª placa)"
                      variant="dropDownList"
                      iconName="trailer"
                      options={v3Options}
                    />
                  </View>
                )}
              </>
            )}
          </View>

          <View style={{ marginTop: 8, height: "auto" }}>
            <ControlledInput
              control={control}
              name="notes"
              label="Observações"
              placeholder="Observações da viagem (opcional)"
              multiline
              style={{ height: 200, padding: 10 }}
            />
          </View>

          <Text style={styles.sectionTitle}>Itens da viagem</Text>

          <AddInvoiceItems
            items={items}
            onChange={setItems}
            typeOptions={typeOptions}
          />

          <Button
            title="Emitir Viagem"
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </View>
  );
}
