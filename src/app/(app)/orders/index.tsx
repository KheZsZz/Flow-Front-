import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { Loadding } from "@/components/loadding";
import { BaixaViagemModal } from "@/components/modalOrdens";
import { createOrdersStyles } from "@/styles/ordens.styles";
import { orderService, statusColor, isFinalized } from "@/services/orders";
import { formatCurrency } from "@/services/formatMoney";

type Period = "all" | "today" | "7d" | "30d";

// "DD/MM/YYYY" -> Date | null
function parseBR(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return isNaN(d.getTime()) ? null : d;
}

export default function OrdersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createOrdersStyles(theme, isMobile);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [baixaOrder, setBaixaOrder] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const orderDate = (o: any) => new Date(o.delivery_date || o.created_at);

  const matchesPeriod = (o: any) => {
    if (period === "all") return true;
    const now = new Date();
    const d = orderDate(o);
    const days = period === "today" ? 1 : period === "7d" ? 7 : 30;
    const limit = new Date(now);
    limit.setDate(now.getDate() - (days - 1));
    limit.setHours(0, 0, 0, 0);
    return d >= limit;
  };

  const matchesRange = (o: any) => {
    const d = orderDate(o);
    const f = parseBR(from);
    const t = parseBR(to);
    if (f && d < f) return false;
    if (t) {
      const end = new Date(t);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (!matchesPeriod(o)) return false;
      if (!matchesRange(o)) return false;
      if (!s) return true;

      const driver = o.drivers?.users?.name_user?.toLowerCase() || "";
      const plates = (o.ordervehicles || [])
        .map((v: any) => v.vehicles?.license_plate?.toLowerCase() || "")
        .join(" ");
      const clientsAndNfe = (o.order_add_itens || [])
        .map((l: any) => {
          const inv = l.orderitem?.invoices;
          return [
            inv?.nfe,
            inv?.remetente?.name_client,
            inv?.destinatario?.name_client,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        })
        .join(" ");

      return (
        driver.includes(s) || plates.includes(s) || clientsAndNfe.includes(s)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, search, period, from, to]);

  const orderTotal = (o: any) =>
    (o.order_add_itens || []).reduce(
      (sum: number, l: any) => sum + (l.orderitem?.invoices?.value_nfe || 0),
      0,
    );

  const PERIODS: { key: Period; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "today", label: "Hoje" },
    { key: "7d", label: "7 dias" },
    { key: "30d", label: "30 dias" },
  ];

  if (loading && orders.length === 0)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.primary} size={50} />
    );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headers}>
          <Text style={styles.title}>Viagens</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/orders/create")}
            style={styles.btn_add}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Buscar por motorista, placa, cliente ou NFe..."
          placeholderTextColor={theme.textSecondary}
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.dateRow}>
          <TextInput
            placeholder="De  DD/MM/AAAA"
            placeholderTextColor={theme.textSecondary}
            style={styles.dateInput}
            value={from}
            onChangeText={setFrom}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Até  DD/MM/AAAA"
            placeholderTextColor={theme.textSecondary}
            style={styles.dateInput}
            value={to}
            onChangeText={setTo}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.chipsRow}>
          {PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setPeriod(p.key)}
              >
                <Text style={active ? styles.chipTextActive : styles.chipText}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma viagem encontrada.</Text>
        }
        renderItem={({ item }) => {
          const finalized = isFinalized(item);
          const itemsCount = (item.order_add_itens || []).length;
          const plates = (item.ordervehicles || [])
            .map((v: any) => v.vehicles?.license_plate)
            .filter(Boolean)
            .join(" · ");

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: statusColor(item.status?.code) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {item.status?.name || "—"}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {orderDate(item).toLocaleDateString("pt-BR")}
                </Text>
              </View>

              <Text style={styles.line}>
                Motorista: {item.drivers?.users?.name_user || "—"}
              </Text>
              <Text style={styles.lineMuted}>Placas: {plates || "—"}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.lineMuted}>{itemsCount} nota(s)</Text>
                <Text style={styles.metaValue}>
                  {formatCurrency(orderTotal(item))}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push(`/(app)/orders/${item.id}`)}
                >
                  <Feather name="eye" size={15} color={theme.text} />
                  <Text style={styles.actionText}>Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, finalized && styles.actionDisabled]}
                  disabled={finalized}
                  onPress={() => router.push(`/(app)/orders/edit/${item.id}`)}
                >
                  <Feather name="edit-2" size={15} color={theme.text} />
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.actionBtnPrimary,
                    (finalized || itemsCount === 0) && styles.actionDisabled,
                  ]}
                  disabled={finalized || itemsCount === 0}
                  onPress={() => setBaixaOrder(item)}
                >
                  <Feather name="check-circle" size={15} color="#FFF" />
                  <Text style={styles.actionTextPrimary}>Baixar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <BaixaViagemModal
        visible={!!baixaOrder}
        order={baixaOrder}
        onClose={() => setBaixaOrder(null)}
        onSuccess={loadData}
      />
    </View>
  );
}
