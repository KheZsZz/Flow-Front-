import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { orderService } from "@/services/orders";
import { ItemStageCard } from "@/components/orders/itemStageCard";
import { Loadding } from "@/components/loadding";
import { createOrdersListStyles } from "@/styles/orders.styles";

export default function TrackOrderScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createOrdersListStyles(theme, isMobile);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<any | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [ord, st] = await Promise.allSettled([
        orderService.getOrderById(id),
        api.get("/status"),
      ]);
      if (ord.status === "fulfilled") setOrder(ord.value);
      if (st.status === "fulfilled")
        setStatuses(Array.isArray(st.value.data) ? st.value.data : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const items = useMemo(
    () =>
      (order?.order_add_itens ?? [])
        .map((l: any) => l.orderitem)
        .filter(Boolean),
    [order],
  );

  const advance = async (item: any, nextCode: number, location?: string) => {
    const target = statuses.find((s: any) => s.code === nextCode);
    if (!target) {
      Alert.alert("Erro", `Status de código ${nextCode} não encontrado.`);
      return;
    }
    setBusyItemId(item.id);
    try {
      await orderService.updateItemStatus(item.id, {
        status_id: target.id,
        location_item: location,
      });
      await load();
    } catch (e: any) {
      Alert.alert(
        "Não foi possível avançar a etapa",
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Transição inválida.",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  if (loading) return <Loadding />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Rastreio da viagem</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* número único de rastreio = VG da viagem */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Feather name="hash" size={16} color={theme.textSecondary} />
          <Text style={{ color: theme.text, fontWeight: "700", fontSize: 16 }}>
            {order?.tracking ?? "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
            · {order?.status?.name ?? "—"}
          </Text>
        </View>

        {items.length === 0 ? (
          <Text style={{ color: theme.textSecondary }}>
            Esta viagem não possui itens.
          </Text>
        ) : (
          items.map((it: any) => (
            <ItemStageCard
              key={it.id}
              item={it}
              busy={busyItemId === it.id}
              onAdvance={advance}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
