import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { SearchField } from "@/components/searchField";
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

  // Filtros de data (react-hook-form) + busca livre (SearchField)
  const { control, watch } = useForm({
    defaultValues: { start_date: "", end_date: "" },
  });
  const dateFilters = watch();
  const [search, setSearch] = useState("");

  // Filtragem client-side: data + busca em posto/placa/motorista
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((item: any) => {
      const d = new Date(item.date_fuel);
      if (dateFilters.start_date && d < new Date(dateFilters.start_date))
        return false;
      if (dateFilters.end_date && d > new Date(dateFilters.end_date))
        return false;

      if (!q) return true;
      const station = String(item.gas_station_name ?? "").toLowerCase();
      const plate = String(item.vehicles?.license_plate ?? "").toLowerCase();
      const driver = String(
        item.created_by_user?.name_user ?? item.driver?.name_user ?? "",
      ).toLowerCase();
      return station.includes(q) || plate.includes(q) || driver.includes(q);
    });
  }, [list, dateFilters, search]);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <View style={styles.header}>
          <Text style={styles.title}>Abastecimento</Text>
          <Text style={styles.subtitle}>
            Histórico de abastecimentos da frota
          </Text>
        </View>

        {/* Data De/Até lado a lado */}
        <View style={styles.filterRow}>
          <View style={styles.filterCell}>
            <ControlledInput
              control={control}
              name="start_date"
              label="De"
              variant="date"
            />
          </View>
          <View style={styles.filterCell}>
            <ControlledInput
              control={control}
              name="end_date"
              label="Até"
              variant="date"
            />
          </View>
        </View>

        {/* Busca única (posto, placa ou motorista) */}
        <SearchField
          placeholder="Buscar por posto, placa ou motorista..."
          onChange={setSearch}
        />
      </View>

      {isLoading ? (
        <Loadding />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum abastecimento encontrado.
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
              {item.vehicles?.license_plate ? (
                <Text style={styles.cardMeta}>
                  Placa: {item.vehicles.license_plate}
                </Text>
              ) : null}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(app)/fuel/create")}
      >
        <Feather name="plus" size={22} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
}
