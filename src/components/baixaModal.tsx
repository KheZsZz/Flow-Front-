import React, { useMemo, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
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
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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

  const enviarCanhoto = async (itemId: string) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploadingId(itemId);
    try {
      await orderService.uploadItemComprovante(itemId, {
        uri: asset.uri,
        name: asset.name ?? `canhoto-${itemId}`,
        mimeType: asset.mimeType,
      });
      onDone();
    } catch {
      /* toast via interceptor */
    } finally {
      setUploadingId(null);
    }
  }; // <-- CORRIGIDO: Chave de fechamento que faltava aqui

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
                // CORRIGIDO: Removida a IIFE desnecessária. As constantes rodam direto no map.
                const code = it.status?.code;
                const done = code === STATUS_CODE.CONCLUIDO;
                const canSelect = code === STATUS_CODE.AGUARDANDO_CANHOTO;

                return (
                  <View
                    key={it.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                      padding: 20,
                    }}
                  >
                    <TouchableOpacity
                      disabled={!canSelect}
                      onPress={() => canSelect && toggle(it.id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                        opacity: canSelect || done ? 1 : 0.5,
                      }}
                    >
                      <Feather
                        name={selected[it.id] ? "check-square" : "square"}
                        size={20}
                        color={canSelect ? theme.link : theme.textSecondary}
                      />
                      <Text style={{ marginLeft: 8, color: theme.text }}>
                        {it.invoices
                          ? `NFe ${it.invoices?.nfe ?? "—"}`
                          : (it.collections?.code ?? "Coleta")}
                      </Text>
                    </TouchableOpacity>

                    {done ? (
                      <Text
                        style={{
                          color: "#15803d",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        Concluído
                      </Text>
                    ) : canSelect ? (
                      <TouchableOpacity
                        disabled={uploadingId === it.id}
                        onPress={() => enviarCanhoto(it.id)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          backgroundColor: "#c2410c",
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          opacity: uploadingId === it.id ? 0.6 : 1,
                        }}
                      >
                        {uploadingId === it.id ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Feather name="upload" size={14} color="#fff" />
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: "700",
                                fontSize: 12,
                              }}
                            >
                              Canhoto
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 11,
                          fontStyle: "italic",
                        }}
                      >
                        aguardando etapas
                      </Text>
                    )}
                  </View>
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
