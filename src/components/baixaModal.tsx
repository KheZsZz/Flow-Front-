import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { orderService, STATUS_CODE } from "@/services/orders";
import { createOrdersListStyles } from "@/styles/orders.styles";

export function BaixarViagemModal({
  visible,
  order,
  onClose,
  onDone,
}: {
  visible: boolean;
  order: any | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createOrdersListStyles(theme, isMobile);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const itens = useMemo(
    () =>
      (order?.order_add_itens ?? [])
        .map((l: any) => l.orderitem)
        .filter(Boolean),
    [order],
  );

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const confirmar = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      Alert.alert("Atenção", "Selecione ao menos um item para baixar.");
      return;
    }
    setBusy(true);
    try {
      await orderService.baixar(order.id, ids);
      setSelected({});
      onDone();
      onClose();
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e?.response?.data?.error || "Não foi possível baixar os itens.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>
              Baixar viagem {order?.tracking ?? ""}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSub}>
            Marque os itens entregues/coletados. Quando todos forem concluídos,
            a viagem é encerrada automaticamente.
          </Text>

          <ScrollView>
            {itens.length === 0 ? (
              <Text style={[styles.modalSub, { paddingVertical: 20 }]}>
                Esta viagem não possui itens.
              </Text>
            ) : (
              itens.map((it: any) => {
                const done = it.status?.code === STATUS_CODE.CONCLUIDO;
                const label = it.invoices
                  ? `NFe ${it.invoices?.nfe ?? "—"}`
                  : (it.collections?.code ?? "Coleta");
                const sub = it.invoices
                  ? it.invoices?.value_nfe != null
                    ? `R$ ${it.invoices.value_nfe}`
                    : undefined
                  : it.collections?.clients?.name_client;
                const on = !!selected[it.id];
                return (
                  <TouchableOpacity
                    key={it.id}
                    style={styles.itemRow}
                    disabled={done}
                    onPress={() => toggle(it.id)}
                  >
                    {done ? (
                      <Feather name="check-circle" size={22} color="#2E7D32" />
                    ) : (
                      <View style={[styles.checkbox, on && styles.checkboxOn]}>
                        {on && <Feather name="check" size={14} color="#fff" />}
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{label}</Text>
                      {!!sub && <Text style={styles.itemSub}>{sub}</Text>}
                    </View>
                    {done && <Text style={styles.doneTag}>Concluída</Text>}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={confirmar}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Concluir selecionados</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
