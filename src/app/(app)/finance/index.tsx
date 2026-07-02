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
import { useTheme } from "@/contexts/themeContext";
import { usePermissions } from "@/hooks/usePermission";
import { createFinanceStyles } from "@/styles/finance.styles";
import {
  useOperationalExpenses,
  useAdministrativeExpenses,
} from "@/hooks/querys/useListData";
import { formatCurrency } from "@/services/formatMoney";
import { Loadding } from "@/components/loadding";
import { useForm } from "react-hook-form";
import { ControlledInput } from "@/components/controllerInput";

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

  const { control, watch, reset } = useForm({
    defaultValues: { start_date: "", end_date: "" },
  });
  const filters = watch();
  const filtered = list.filter((item: any) => {
    const d = new Date(item.expense_date);
    if (filters.start_date && d < new Date(filters.start_date)) return false;
    if (filters.end_date && d > new Date(filters.end_date)) return false;
    return true;
  });
  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <View style={styles.header}>
          <Text style={styles.title}>Custos</Text>
          <Text style={styles.subtitle}>
            Despesas operacionais e administrativas da operação
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <ControlledInput
            control={control}
            name="start_date"
            label="De"
            variant="date"
          />
          <ControlledInput
            control={control}
            name="end_date"
            label="Até"
            variant="date"
          />
        </View>

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
                onPress={() => setActive(tab.key)}
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
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum custo lançado ainda.</Text>
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
