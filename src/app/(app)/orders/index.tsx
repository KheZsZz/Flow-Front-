import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";

import { useTheme } from "@/contexts/themeContext";
import { Loadding } from "@/components/loadding";
import { BaixaViagemModal } from "@/components/modalOrdens";
import { ControlledInput } from "@/components/controllerInput";
import { createOrdersStyles } from "@/styles/ordens.styles";
import { orderService } from "@/services/orders";
import { PERIODS, PeriodsTypes } from "@/constants/colors";

const parseBR = (s: string): Date | null => {
  const parts = s.split("/");
  if (parts.length !== 3) return null;
  let [day, month, year] = parts.map(Number);
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  return !isNaN(d.getTime()) ? d : null;
};

export default function OrdersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createOrdersStyles(theme, isMobile);

  const { control, watch } = useForm({
    defaultValues: { search: "", from: "", to: "" },
  });

  const search = watch("search");
  const from = watch("from");
  const to = watch("to");

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<PeriodsTypes["key"]>("all");
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

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const f = parseBR(from);
    const t = parseBR(to);
    const now = new Date();

    return orders.filter((o) => {
      const d = new Date(o.delivery_date || o.created_at);

      if (period !== "all") {
        const days = period === "today" ? 1 : period === "7d" ? 7 : 30;
        const limit = new Date(now);
        limit.setDate(now.getDate() - (days - 1));
        limit.setHours(0, 0, 0, 0);
        if (d < limit) return false;
      }

      if (f && d < f) return false;
      if (t) {
        const end = new Date(t);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }

      if (!s) return true;
      const driver = o.drivers?.users?.name_user?.toLowerCase() || "";
      const plates = (o.ordervehicles || [])
        .map((v: any) => v.vehicles?.license_plate?.toLowerCase() || "")
        .join(" ");
      const clientsAndNfe = (o.order_add_itens || [])
        .map((l: any) =>
          [
            l.orderitem?.invoices?.nfe,
            l.orderitem?.invoices?.remetente?.name_client,
          ]
            .filter(Boolean)
            .join(" "),
        )
        .join(" ")
        .toLowerCase();

      return (
        driver.includes(s) || plates.includes(s) || clientsAndNfe.includes(s)
      );
    });
  }, [orders, search, period, from, to]);

  if (loading)
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

        <ControlledInput
          control={control}
          name="search"
          placeholder="Buscar por motorista, placa, cliente ou NFe..."
          iconName="magnifying-glass"
          variant="text"
        />

        <View style={styles.dateRow}>
          <ControlledInput
            control={control}
            name="from"
            placeholder="De DD/MM/AAAA"
            mask="99/99/9999"
            style={{ flex: 1 }}
            keyboardType="numeric"
          />
          <ControlledInput
            control={control}
            name="to"
            placeholder="Até DD/MM/AAAA"
            mask="99/99/9999"
            style={{ flex: 1 }}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.chipsRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.chip, period === p.key && styles.chipActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text
                style={
                  period === p.key ? styles.chipTextActive : styles.chipText
                }
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Mantenha aqui a estrutura visual do seu card original */}
          </View>
        )}
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
