import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { useWindowDimensions } from "react-native";
import { createOrdersStyles } from "@/styles/ordens.styles";
import { orderService, STATUS_CODE } from "@/services/orders";
import { formatCurrency } from "@/services/formatMoney";

interface BaixaItem {
  id: string;
  nfe?: string;
  value?: number;
  type_orders?: string;
  done: boolean;
}

export function BaixaViagemModal({
  visible,
  order,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  order: any | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createOrdersStyles(theme, isMobile);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const items: BaixaItem[] = useMemo(() => {
    const links = order?.order_add_itens ?? [];
    return links
      .map((l: any) => l.orderitem)
      .filter(Boolean)
      .map((oi: any) => ({
        id: oi.id,
        nfe: oi.invoices?.nfe,
        value: oi.invoices?.value_nfe,
        type_orders: oi.type_orders,
        done: oi.status?.code === STATUS_CODE.CONCLUIDO,
      }));
  }, [order]);

  const pending = items.filter((i) => !i.done);
  const allSelected =
    pending.length > 0 && pending.every((i) => selected[i.id]);
  const selectedIds = pending.filter((i) => selected[i.id]).map((i) => i.id);

  // se ao concluir os selecionados não sobrar nenhum pendente -> encerra
  const willClose = pending.length > 0 && selectedIds.length === pending.length;

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const toggleAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const next: Record<string, boolean> = {};
      pending.forEach((i) => (next[i.id] = true));
      setSelected(next);
    }
  };

  const confirm = async () => {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      await orderService.baixar(order.id, selectedIds);
      setSelected({});
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert(
        "Erro ao baixar",
        e?.response?.data?.error || "Não foi possível concluir as notas.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Baixar viagem</Text>
          <Text style={styles.modalSub}>
            Marque as notas concluídas. Quando todas forem concluídas, a viagem
            é encerrada e não poderá mais ser alterada.
          </Text>

          {pending.length > 0 && (
            <TouchableOpacity style={styles.actionBtn} onPress={toggleAll}>
              <Feather
                name={allSelected ? "check-square" : "square"}
                size={16}
                color={theme.text}
              />
              <Text style={styles.actionText}>
                {allSelected ? "Desmarcar todas" : "Marcar todas pendentes"}
              </Text>
            </TouchableOpacity>
          )}

          <ScrollView style={{ marginTop: 8 }}>
            {items.map((it) => (
              <TouchableOpacity
                key={it.id}
                style={styles.itemRow}
                disabled={it.done}
                onPress={() => toggle(it.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    (it.done || selected[it.id]) && styles.checkboxOn,
                  ]}
                >
                  {(it.done || selected[it.id]) && (
                    <Feather name="check" size={14} color="#FFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    NFe {it.nfe ?? "—"}
                    {it.type_orders ? `  ·  ${it.type_orders}` : ""}
                  </Text>
                  <Text style={styles.itemSub}>
                    {it.value != null ? formatCurrency(it.value) : ""}
                  </Text>
                </View>
                {it.done && <Text style={styles.doneTag}>Concluída</Text>}
              </TouchableOpacity>
            ))}
            {items.length === 0 && (
              <Text style={styles.empty}>Nenhuma nota nesta viagem.</Text>
            )}
          </ScrollView>

          {willClose && (
            <View style={styles.warn}>
              <Text style={styles.warnText}>
                ⚠ Isto concluirá todas as notas pendentes e encerrará a viagem
                definitivamente.
              </Text>
            </View>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnGhost]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                styles.modalBtnPrimary,
                selectedIds.length === 0 && styles.actionDisabled,
              ]}
              onPress={confirm}
              disabled={saving || selectedIds.length === 0}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalBtnTextPrimary}>
                  Concluir{" "}
                  {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
