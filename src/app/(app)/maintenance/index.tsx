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
import { createMaintenanceStyles } from "@/styles/maintenance.styles";
import {
  useMaintenances,
  useMaintenanceTypes,
} from "@/hooks/querys/useListData";
import { formatCurrency } from "@/services/formatMoney";
import { Loadding } from "@/components/loadding";

type FiltersForm = {
  start_date: string;
  end_date: string;
  category: string; // "", "Preventiva", "Corretiva"
  min_cost: string;
  max_cost: string;
};

export default function MaintenanceScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createMaintenanceStyles(theme, isMobile);
  const router = useRouter();

  const { data: list = [], isLoading } = useMaintenances();
  const { data: types = [] } = useMaintenanceTypes();

  const { control, watch } = useForm<FiltersForm>({
    defaultValues: {
      start_date: "",
      end_date: "",
      category: "",
      min_cost: "",
      max_cost: "",
    },
  });
  const filters = watch();
  const [plateSearch, setPlateSearch] = useState("");

  // Categorias vindas do banco (Preventiva/Corretiva) — só as usadas
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(types.map((t: any) => t.category))).sort();
    return [
      { label: "Todas as categorias", value: "" },
      ...cats.map((c) => ({ label: c, value: c })),
    ];
  }, [types]);

  // Filtragem client-side: data + categoria + placa + faixa de valor
  const filtered = useMemo(() => {
    const q = plateSearch.trim().toLowerCase();
    const min = filters.min_cost ? Number(filters.min_cost) : null;
    const max = filters.max_cost ? Number(filters.max_cost) : null;

    return list.filter((item: any) => {
      const d = new Date(item.performed_at);
      if (filters.start_date && d < new Date(filters.start_date)) return false;
      if (filters.end_date && d > new Date(filters.end_date)) return false;

      if (filters.category) {
        const cat = item.maintenance_types?.category;
        if (cat !== filters.category) return false;
      }

      if (q) {
        const plate = String(item.vehicles?.license_plate ?? "").toLowerCase();
        if (!plate.includes(q)) return false;
      }

      const cost = Number(item.cost);
      if (min !== null && cost < min) return false;
      if (max !== null && cost > max) return false;

      return true;
    });
  }, [list, filters, plateSearch]);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <View style={styles.header}>
          <Text style={styles.title}>Manutenções</Text>
          <Text style={styles.subtitle}>Histórico de manutenções da frota</Text>
        </View>

        {/* Data De/Até */}
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

        {/* Categoria */}
        <ControlledInput
          control={control}
          name="category"
          label="Categoria"
          variant="dropDownList"
          options={categoryOptions}
        />

        {/* Faixa de valor */}
        <View style={styles.filterRow}>
          <View style={styles.filterCell}>
            <ControlledInput
              control={control}
              name="min_cost"
              label="Valor mín. (R$)"
              variant="numeric"
            />
          </View>
          <View style={styles.filterCell}>
            <ControlledInput
              control={control}
              name="max_cost"
              label="Valor máx. (R$)"
              variant="numeric"
            />
          </View>
        </View>

        {/* Busca por placa */}
        <SearchField
          placeholder="Buscar por placa..."
          onChange={setPlateSearch}
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
                Nenhuma manutenção encontrada.
              </Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardCode}>{item.code ?? "—"}</Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(item.cost)}
                </Text>
              </View>
              <Text style={styles.cardType}>
                {item.maintenance_types?.name ?? item.maintenance_type}
                {item.maintenance_types?.category
                  ? ` · ${item.maintenance_types.category}`
                  : ""}
              </Text>
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
