import React from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { createInvoiceListStyles } from "@/styles/invoices.styles";

export const InvoiceList = ({ data, loading, onRefresh }: any) => {
  const { theme } = useTheme();
  const styles = createInvoiceListStyles(theme);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
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
            <Text style={styles.dateText}>
              {new Date(item.issue_date).toLocaleDateString("pt-BR")}
            </Text>
            <Text
              style={{
                color: item.cte === "AGUARDANDO" ? "#EF6C00" : "#2E7D32",
                fontWeight: "bold",
              }}
            >
              {item.cte}
            </Text>
          </View>
        </View>
      )}
    />
  );
};
