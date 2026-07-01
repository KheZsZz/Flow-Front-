import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { orderService, isFinalized } from "@/services/orders";
import { BaixarViagemModal } from "@/components/baixaModal";
import { Loadding } from "@/components/loadding";
import { createOrdersListStyles } from "@/styles/orders.styles";
import { useOrders, listKeys } from "@/hooks/querys/useListData";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

type DateField = "delivery_date" | "created_at" | "finaled_at";

const DATE_FIELD_OPTIONS = [
  { label: "Entrega", value: "delivery_date" },
  { label: "Emissão", value: "created_at" },
  { label: "Finalização", value: "finaled_at" },
];

interface FilterForm {
  search: string;
  dateField: DateField;
  from: string;
  to: string;
}

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export default function OrdersListScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width <= 820;
  const styles = createOrdersListStyles(theme, isMobile);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [baixarTarget, setBaixarTarget] = useState<any | null>(null);

  const { data: orders = [], isLoading, refetch } = useOrders();
  useRefreshOnFocus(refetch);

  const { control, watch } = useForm<FilterForm>({
    defaultValues: {
      search: "",
      dateField: "delivery_date",
      from: "",
      to: "",
    },
  });
  const search = watch("search");
  const dateField = watch("dateField");
  const from = watch("from");
  const to = watch("to");

  const onDelete = (order: any) => {
    Alert.alert("Excluir viagem", `Excluir a viagem ${order.tracking}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await orderService.deleteOrder(order.id);
            queryClient.invalidateQueries({ queryKey: listKeys.orders });
          } catch (e: any) {}
        },
      },
    ]);
  };

  const plates = (o: any) =>
    (o.ordervehicles ?? [])
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      .map((ov: any) => ov.vehicles?.license_plate)
      .filter(Boolean)
      .join(" + ");

  const clientNames = (o: any) =>
    (o.order_add_itens ?? [])
      .map((l: any) => l.orderitem)
      .map(
        (oi: any) =>
          oi?.invoices?.destinatario?.name_client ??
          oi?.collections?.clients?.name_client ??
          "",
      )
      .filter(Boolean)
      .join(" ");

  const filtered = useMemo(() => {
    const q = (search ?? "").trim().toLowerCase();
    const fromD = from ? startOfDay(new Date(from)) : null;
    const toD = to ? endOfDay(new Date(to)) : null;

    return orders.filter((o) => {
      const matchesText =
        !q ||
        o.tracking?.toLowerCase().includes(q) ||
        o.drivers?.users?.name_user?.toLowerCase().includes(q) ||
        plates(o).toLowerCase().includes(q) ||
        clientNames(o).toLowerCase().includes(q);
      if (!matchesText) return false;

      if (fromD || toD) {
        const raw = o[dateField];
        if (!raw) return false;
        const d = new Date(raw);
        if (fromD && d < fromD) return false;
        if (toD && d > toD) return false;
      }
      return true;
    });
  }, [orders, search, dateField, from, to]);

  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

  if (isLoading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.text} size={50} />
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Viagens</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/orders/create")}
        >
          <Feather name="plus" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ControlledInput
        control={control}
        name="search"
        placeholder="Buscar por rastreio, motorista, placa ou cliente..."
        iconName="magnifying-glass"
      />
      <Text style={styles.filterLabel}>Filtrar por data</Text>
      <ControlledInput
        control={control}
        name="dateField"
        variant="select"
        options={DATE_FIELD_OPTIONS}
      />
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <ControlledInput
            control={control}
            name="from"
            label="De"
            variant="date"
            iconName="calendar"
          />
        </View>
        <View style={{ flex: 1 }}>
          <ControlledInput
            control={control}
            name="to"
            label="Até"
            variant="date"
            iconName="calendar"
          />
        </View>
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma viagem encontrada.</Text>
      ) : (
        <View style={styles.gridContainer}>
          {filtered.map((o) => {
            const fin = isFinalized(o);
            return (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.trackingText}>{o.tracking ?? "—"}</Text>
                    <Text style={styles.driverName} numberOfLines={1}>
                      {o.drivers?.users?.name_user ?? "Sem motorista"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: fin
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(59,130,246,0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: fin ? "#22c55e" : "#3b82f6" },
                      ]}
                    >
                      {o.status?.name ?? "—"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Feather
                      name="truck"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText}>
                      {plates(o) || "Sem veículos"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather
                      name="calendar"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText}>
                      Entrega: {fmt(o.delivery_date)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather
                      name="package"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText}>
                      {o.order_add_itens?.length ?? 0} item(ns)
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  {!fin && (
                    <TouchableOpacity
                      style={[styles.footBtn, styles.baixarBtn]}
                      onPress={() => setBaixarTarget(o)}
                    >
                      <Feather
                        name="check-square"
                        size={14}
                        color={theme.isDark ? "#4ade80" : "#15803d"}
                      />
                      <Text style={styles.baixarText}>Baixar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.footBtn, styles.editBtn]}
                    onPress={() => router.push(`/orders/edit/${o.id}`)}
                  >
                    <Feather
                      name="edit-2"
                      size={14}
                      color={theme.isDark ? "#60a5fa" : "#1a73e8"}
                    />
                    <Text style={styles.editText}>
                      {fin ? "Ver" : "Editar"}
                    </Text>
                  </TouchableOpacity>
                  {!fin && (
                    <TouchableOpacity
                      style={[styles.footBtn, styles.deleteBtn]}
                      onPress={() => onDelete(o)}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                      <Text style={styles.deleteText}>Excluir</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.footBtn, styles.editBtn]}
                    onPress={() => router.push(`/orders/track/${o.id}`)}
                  >
                    <Feather
                      name="map-pin"
                      size={14}
                      color={theme.isDark ? "#60a5fa" : "#1a73e8"}
                    />
                    <Text style={styles.editText}>Rastrear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <BaixarViagemModal
        visible={!!baixarTarget}
        order={baixarTarget}
        onClose={() => setBaixarTarget(null)}
        onDone={() =>
          queryClient.invalidateQueries({ queryKey: listKeys.orders })
        }
      />
    </ScrollView>
  );
}
