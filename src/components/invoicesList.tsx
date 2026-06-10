import React, { useState } from "react";
import { useTheme } from "@/contexts/themeContext";
import { createInvoiceListStyles } from "@/styles/invoices.styles";
import { router } from "expo-router";
import { InvoiceActions } from "@/components/actionsInvoices";
import { invoiceService } from "@/services/invoices";

import {
  View,
  Text,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const handleDelete = async () => {
    if (idToDelete) {
      await invoiceService.deleteInvoice(idToDelete);
      if (onDeleteSuccess) onDeleteSuccess();
      setModalVisible(false);
    }
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
              {item.cte}
            </Text>
          </View>
          <View
            style={[styles.actionsContainer, { zIndex: 1000, elevation: 10 }]}
          >
            <Text style={styles.dateText}>
              {new Date(item.issue_date).toLocaleDateString("pt-BR")}
            </Text>

            <InvoiceActions
              onEdit={() => router.push(`/(app)/invoices/edit/${item.id}`)}
              onView={() => router.push(`/(app)/invoices/${item.id}`)}
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
