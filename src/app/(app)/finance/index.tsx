import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { usePermissions } from "@/hooks/usePermission";
import { ControlledInput } from "@/components/controllerInput";
import { createFinanceStyles } from "@/styles/finance.styles";
import {
  useOperationalExpenses,
  useAdministrativeExpenses,
  useExpenseTypes,
} from "@/hooks/querys/useListData";
import { formatCurrency } from "@/services/formatMoney";
import { Loadding } from "@/components/loadding";

type TabKey = "operational" | "administrative";

export default function FinanceScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createFinanceStyles(theme, isMobile);
  const router = useRouter();
  const { hasMinRole } = usePermissions();

  const canSeeAdministrative = hasMinRole("Financer");

  const tabs = [
    {
      key: "operational" as TabKey,
      label: "Operacionais",
      icon: "truck",
      show: true,
    },
    {
      key: "administrative" as TabKey,
      label: "Administrativos",
      icon: "briefcase",
      show: canSeeAdministrative,
    },
  ].filter((t) => t.show);

  const [active, setActive] = useState<TabKey>("operational");

  const operational = useOperationalExpenses();
  const administrative = useAdministrativeExpenses();
  const current = active === "operational" ? operational : administrative;
  const list = current.data ?? [];

  // ── Filtros: data + tipo de despesa (categoria) ──
  const { control, watch, reset } = useForm({
    defaultValues: { start_date: "", end_date: "", expense_type_id: "" },
  });
  const filters = watch();

  // Tipos da categoria atualmente ativa (client-side)
  const { data: types = [] } = useExpenseTypes(
    active === "operational" ? "Operacional" : "Administrativo",
  );

  // Toda vez que trocar de aba, limpa o filtro de tipo pra não misturar categorias
  const handleTabChange = (next: TabKey) => {
    setActive(next);
    reset({ ...filters, expense_type_id: "" });
  };

  const typeOptions = useMemo(
    () => [
      { label: "Todas as categorias", value: "" },
      ...types.map((t: any) => ({ label: t.name, value: t.id })),
    ],
    [types],
  );

  // Filtragem client-side (data + expense_type_id)
  const filtered = useMemo(() => {
    return list.filter((item: any) => {
      const d = new Date(item.expense_date);
      if (filters.start_date && d < new Date(filters.start_date)) return false;
      if (filters.end_date && d > new Date(filters.end_date)) return false;
      if (
        filters.expense_type_id &&
        item.expense_type_id !== filters.expense_type_id
      )
        return false;
      return true;
    });
  }, [list, filters]);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <View style={styles.header}>
          <Text style={styles.title}>Custos</Text>
          <Text style={styles.subtitle}>
            Despesas operacionais e administrativas da operação
          </Text>
        </View>

        {/* Filtros de data */}
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

        {/* Filtro por tipo (categoria) — reflete a aba ativa */}
        <ControlledInput
          control={control}
          name="expense_type_id"
          label="Categoria"
          variant="dropDownList"
          options={typeOptions}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBarScroll}
          contentContainerStyle={styles.tabBar}
        >
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabChange(tab.key)}
              >
                <Feather
                  name={tab.icon as any}
                  size={14}
                  color={isActive ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {current.isLoading ? (
        <Loadding />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum custo encontrado com esses filtros.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardType}>
                  {item.expense_types?.name ?? "Custo"}
                </Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <Text style={styles.cardMeta}>
                {item.vehicles?.license_plate
                  ? `${item.vehicles.license_plate} · `
                  : ""}
                {new Date(item.expense_date).toLocaleDateString("pt-BR")}
              </Text>
              {item.description ? (
                <Text style={styles.cardMeta}>{item.description}</Text>
              ) : null}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/(app)/finance/create?category=${active}`)}
      >
        <Feather name="plus" size={22} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
}
