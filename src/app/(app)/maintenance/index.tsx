import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { createMaintenanceStyles } from "@/styles/maintenance.styles";
import { useMaintenances } from "@/hooks/querys/useListData";
import { formatCurrency } from "@/services/formatMoney";
import { Loadding } from "@/components/loadding";

export default function MaintenanceScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createMaintenanceStyles(theme, isMobile);
  const router = useRouter();

  const { data: list = [], isLoading } = useMaintenances();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manutenções</Text>
        <Text style={styles.subtitle}>Histórico de manutenções da frota</Text>
      </View>

      {isLoading ? (
        <Loadding />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma manutenção registrada ainda.
              </Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardType}>{item.maintenance_type}</Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(item.cost)}
                </Text>
              </View>
              <Text style={styles.cardMeta}>
                {item.vehicles?.license_plate ?? "—"} ·{" "}
                {new Date(item.performed_at).toLocaleDateString("pt-BR")}
              </Text>
              {item.odometer ? (
                <Text style={styles.cardMeta}>
                  Odômetro: {item.odometer} km
                </Text>
              ) : null}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(app)/maintenance/create")}
      >
        <Feather name="plus" size={22} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
}
