import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { createFuelStyles } from "@/styles/fuel.styles";
import { useFuelEntries } from "@/hooks/querys/useListData";
import { formatCurrency } from "@/services/formatMoney";
import { Loadding } from "@/components/loadding";

export default function FuelScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createFuelStyles(theme, isMobile);
  const router = useRouter();

  const { data: list = [], isLoading } = useFuelEntries();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Abastecimento</Text>
        <Text style={styles.subtitle}>
          Histórico de abastecimentos da frota
        </Text>
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
                Nenhum abastecimento lançado ainda.
              </Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardStation}>{item.gas_station_name}</Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(item.total_price)}
                </Text>
              </View>
              <Text style={styles.cardMeta}>
                {item.liters}L · {item.fuel_type} ·{" "}
                {new Date(item.date_fuel).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(app)/fuel/create")}
      >
        <Feather name="plus" size={22} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
