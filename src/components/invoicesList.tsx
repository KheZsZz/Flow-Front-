import React, { useState } from "react";
import { useTheme } from "@/contexts/themeContext";
import { createInvoiceListStyles } from "@/styles/invoices.styles";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { InvoiceActions } from "@/components/actionsInvoices";
import { invoiceService } from "@/services/invoices";
import { formatCurrency, formatCurrencyCTe } from "@/services/formatMoney";

import {
  View,
  Text,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { ConfirmModal } from "@/components/modal";

export const InvoiceList = ({
  data,
  loading,
  onRefresh,
  onDeleteSuccess,
}: any) => {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createInvoiceListStyles(theme, isMobile);

  const [modalVisible, setModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const refresh = () => {
    if (onRefresh) onRefresh();
    else if (onDeleteSuccess) onDeleteSuccess();
  };

  const handleDelete = async () => {
    if (idToDelete) {
      await invoiceService.deleteInvoice(idToDelete);
      if (onDeleteSuccess) onDeleteSuccess();
      setModalVisible(false);
    }
  };

  // abre o canhoto/comprovante (imagem ou PDF) — URL pública do bucket
  const openComprovante = async (item: any) => {
    if (!item.comprovante_url) return;
    try {
      if (Platform.OS === "web") {
        window.open(item.comprovante_url, "_blank");
      } else {
        await Linking.openURL(item.comprovante_url);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o comprovante.");
    }
  };

  const handleUploadComprovante = async (item: any) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploadingId(item.id);
    try {
      await invoiceService.uploadComprovante(item.id, {
        uri: asset.uri,
        name: asset.name ?? `comprovante-${item.nfe}`,
        mimeType: asset.mimeType,
      });
      refresh();
    } catch {
      // toast via interceptor
    } finally {
      setUploadingId(null);
    }
  };

  // status de entrega no lugar da data de emissão
  const renderDeliveryStatus = (item: any) => {
    if (item.delivery_status === "finalizada") {
      // toca pra abrir o canhoto
      return (
        <TouchableOpacity
          style={[
            styles.badge,
            {
              backgroundColor: "#dcfce7",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            },
          ]}
          onPress={() => openComprovante(item)}
        >
          <Feather name="eye" size={12} color="#15803d" />
          <Text style={[styles.badgeText, { color: "#15803d" }]}>
            Finalizada
          </Text>
        </TouchableOpacity>
      );
    }

    if (item.delivery_status === "aguardando_comprovante") {
      const busy = uploadingId === item.id;
      return (
        <TouchableOpacity
          style={[
            styles.badge,
            {
              backgroundColor: "#ffedd5",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            },
          ]}
          onPress={() => handleUploadComprovante(item)}
          disabled={busy}
        >
          <Feather name="upload" size={12} color="#c2410c" />
          <Text style={[styles.badgeText, { color: "#c2410c" }]}>
            {busy ? "Enviando..." : "Aguardando comprovante"}
          </Text>
        </TouchableOpacity>
      );
    }

    // nota ainda não entregue na viagem -> mantém a data de emissão
    return (
      <Text style={styles.dateText}>
        {new Date(item.issue_date).toLocaleDateString("pt-BR")}
      </Text>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.invoiceNumber}>NFe: {item.nfe}</Text>
            <Text style={styles.invoiceValue}>
              {formatCurrency(item.value_nfe)}
            </Text>
          </View>
          <Text style={styles.issuerText}>
            Remetente: {item.remetente?.name_client}
          </Text>
          <Text style={styles.issuerText}>
            Dest: {item.destinatario?.name_client}
          </Text>
          <View style={styles.cardFooter}>
            <Text
              style={{
                color: item.cte === "AGUARDANDO" ? "#EF6C00" : "#2E7D32",
                fontWeight: "bold",
              }}
            >
              CT-e {item.cte}
            </Text>

            <Text
              style={{
                color: item.cte === "AGUARDANDO" ? "#EF6C00" : "#2E7D32",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {formatCurrencyCTe(item.cte_value)}
            </Text>
          </View>
          <View
            style={[styles.actionsContainer, { zIndex: 1000, elevation: 10 }]}
          >
            {renderDeliveryStatus(item)}

            <InvoiceActions
              hasComprovante={!!item.comprovante_url}
              onViewComprovante={() => openComprovante(item)}
              onEdit={() => router.push(`/(app)/invoices/edit/${item.id}`)}
              onDelete={() => {
                setIdToDelete(item.id);
                setModalVisible(true);
              }}
            />
          </View>

          <ConfirmModal
            visible={modalVisible}
            title="Confirmar exclusão"
            message="Tem certeza que deseja eliminar esta nota? Esta ação não pode ser desfeita."
            onConfirm={handleDelete}
            onCancel={() => setModalVisible(false)}
          />
        </View>
      )}
    />
  );
};
