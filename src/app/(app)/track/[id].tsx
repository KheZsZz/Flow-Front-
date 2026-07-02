import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { orderService, STATUS_CODE } from "@/services/orders";
import { ItemStageCard } from "@/components/orders/itemStageCard";
import { Loadding } from "@/components/loadding";
import { createOrdersListStyles } from "@/styles/orders.styles";
import { usePermissions } from "@/hooks/usePermission";

export default function TrackOrderScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createOrdersListStyles(theme, isMobile);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { profile } = usePermissions();
  const canEditEvents = ["Manager", "Admin", "Requestor"].includes(profile);

  const [order, setOrder] = useState<any | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [concluding, setConcluding] = useState(false);

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

  const orderCode = order?.status?.code;
  const canStart = orderCode === STATUS_CODE.EM_ABERTO && !order?.finaled_at;
  const canConcluir = !order?.finaled_at && orderCode !== STATUS_CODE.EM_ABERTO;

  const startTrip = async () => {
    setStarting(true);
    try {
      await orderService.startOrder(id);
      await load();
    } catch {
      /* toast via interceptor */
    } finally {
      setStarting(false);
    }
  };

  const advance = async (item: any, nextCode: number, location?: string) => {
    const target = statuses.find((s: any) => s.code === nextCode);
    if (!target) {
      Alert.alert("Erro", `Status de código ${nextCode} não encontrado.`); // erro LOCAL, sem request — mantém
      return;
    }
    setBusyItemId(item.id);
    try {
      await orderService.updateItemStatus(item.id, {
        status_id: target.id,
        location_item: location,
      });
      await load();
    } catch {
      /* toast via interceptor (mostra a mensagem do guard) */
    } finally {
      setBusyItemId(null);
    }
  };

  const sendCanhoto = async (item: any) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setBusyItemId(item.id);
    try {
      await orderService.uploadItemComprovante(item.id, {
        uri: asset.uri,
        name: asset.name ?? `canhoto-${item.id}`,
        mimeType: asset.mimeType,
      });
      await load();
    } catch {
      /* toast via interceptor */
    } finally {
      setBusyItemId(null);
    }
  };

  const concluir = () => {
    Alert.alert(
      "Concluir viagem",
      "Isso conclui todos os itens pendentes, avançando pelas etapas automaticamente. Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Concluir",
          style: "destructive",
          onPress: async () => {
            setConcluding(true);
            try {
              await orderService.concluirOrder(id);
              await load();
            } catch {
              /* toast via interceptor */
            } finally {
              setConcluding(false);
            }
          },
        },
      ],
    );
  };

  const editEvent = async (
    eventId: string,
    payload: { created_at?: string; location_item?: string },
  ) => {
    try {
      await orderService.updateTrackingEvent(eventId, payload);
      await load();
    } catch {
      /* toast via interceptor */
    }
  };

  if (loading) return <Loadding />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Rastreio da viagem</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
          width: isMobile ? undefined : "50%",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Feather name="hash" size={16} color={theme.text} />
          <Text style={{ color: theme.text, fontWeight: "700", fontSize: 16 }}>
            {order?.tracking ?? "—"}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
            · {order?.status?.name ?? "—"}
          </Text>
        </View>

        {canStart && (
          <TouchableOpacity
            disabled={starting}
            onPress={startTrip}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#1d4ed8",
              paddingVertical: 13,
              borderRadius: 10,
              marginBottom: 16,
              opacity: starting ? 0.6 : 1,
            }}
          >
            {starting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="play" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Iniciar viagem
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {canConcluir && (
          <TouchableOpacity
            disabled={concluding}
            onPress={concluir}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#15803d",
              paddingVertical: 13,
              borderRadius: 10,
              marginBottom: 16,
              opacity: concluding ? 0.6 : 1,
            }}
          >
            {concluding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="flag" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Concluir viagem
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {items.length === 0 ? (
          <Text style={{ color: theme.error }}>
            Esta viagem não possui itens.
          </Text>
        ) : (
          items.map((it: any) => (
            <ItemStageCard
              key={it.id}
              item={it}
              busy={busyItemId === it.id}
              onAdvance={advance}
              onSendCanhoto={sendCanhoto}
              canEditEvents={canEditEvents}
              onEditEvent={editEvent}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
