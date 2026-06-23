import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { ControlledInput } from "@/components/controllerInput";
import { createDashboardStyles } from "@/styles/dashboard.styles";
import {
  KpiCard,
  MiniBars,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard/primitives";
import {
  dashboardService,
  withinRange,
  countBy,
  recordToBars,
  orderIsFinalized,
  orderStatusName,
  orderDriverId,
  orderPlates,
  orderItems,
  lastNDays,
  bucketByDay,
} from "@/services/dashboard";
import { Loadding } from "../loadding";
import { PieStatusChart } from "@/components/dashboard/charts/PieStatusChart";
import { DynamicBarChart } from "@/components/dashboard/charts/DynamicBarChart";
import { toSlices } from "@/services/dashboard";

type FilterForm = {
  start_date?: string;
  end_date?: string;
  status?: string;
};

export function DriverPanel({ isMobile }: { isMobile: boolean }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createDashboardStyles(theme, isMobile);
  const accent = theme.isDark ? theme.link : theme.primary;

  const myUserId = user?.user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  const { control, watch, reset } = useForm<FilterForm>({
    defaultValues: { start_date: undefined, end_date: undefined, status: "" },
  });
  const filters = watch();

  useEffect(() => {
    setLoading(true);
    dashboardService
      .getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Só as viagens do motorista logado ──────────────────────────────── */
  const myOrders = useMemo(
    () => orders.filter((o) => orderDriverId(o) === myUserId),
    [orders, myUserId],
  );

  const fOrders = useMemo(
    () =>
      myOrders
        .filter((o) =>
          withinRange(o.created_at, filters.start_date, filters.end_date),
        )
        .filter((o) =>
          filters.status ? orderStatusName(o) === filters.status : true,
        ),
    [myOrders, filters.start_date, filters.end_date, filters.status],
  );

  const k = useMemo(() => {
    const finalized = fOrders.filter(orderIsFinalized).length;
    const open = fOrders.length - finalized;
    const itemsToDeliver = fOrders
      .filter((o) => !orderIsFinalized(o))
      .reduce((acc, o) => acc + orderItems(o).length, 0);
    return { total: fOrders.length, open, finalized, itemsToDeliver };
  }, [fOrders]);

  const byStatus = useMemo(
    () => recordToBars(countBy(fOrders, orderStatusName)),
    [fOrders],
  );

  const statusSlices = useMemo(
    () => toSlices(countBy(fOrders, orderStatusName)),
    [fOrders],
  );

  const days7 = useMemo(() => lastNDays(7), []);
  const myCreated = useMemo(
    () => bucketByDay(myOrders, (o) => o.created_at, days7),
    [myOrders, days7],
  );
  const myFinalized = useMemo(
    () => bucketByDay(myOrders, (o) => o.finaled_at, days7),
    [myOrders, days7],
  );

  const statusOptions = useMemo(() => {
    const names = Array.from(new Set(myOrders.map(orderStatusName)));
    return [
      { label: "Todos os status", value: "" },
      ...names.map((n) => ({ label: n, value: n })),
    ];
  }, [myOrders]);

  /* ── Próximas entregas (não finalizadas, ordenadas por data) ────────── */
  const upcoming = useMemo(
    () =>
      myOrders
        .filter((o) => !orderIsFinalized(o) && o.delivery_date)
        .sort(
          (a, b) =>
            new Date(a.delivery_date).getTime() -
            new Date(b.delivery_date).getTime(),
        )
        .slice(0, 5),
    [myOrders],
  );

  const hasFilters =
    !!filters.start_date || !!filters.end_date || !!filters.status;

  if (loading) return <Loadding color={accent} size={50} />;

  return (
    <View style={{ gap: 18 }}>
      {/* ── Filtros ─────────────────────────────────────────────────── */}
      <View style={styles.filterBar}>
        <Text style={styles.filterTitle}>Filtros</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <ControlledInput
              control={control}
              name="start_date"
              label="De"
              variant="date"
              iconName="calendar"
            />
          </View>
          <View style={styles.filterCol}>
            <ControlledInput
              control={control}
              name="end_date"
              label="Até"
              variant="date"
              iconName="calendar"
            />
          </View>
        </View>
        <ControlledInput
          control={control}
          name="status"
          label="Status"
          variant="dropDownList"
          options={statusOptions}
          iconName="filter"
        />
        {hasFilters && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() =>
              reset({ start_date: undefined, end_date: undefined, status: "" })
            }
          >
            <Feather
              name="x"
              size={14}
              color={theme.isDark ? "#60a5fa" : "#1a73e8"}
            />
            <Text style={styles.clearBtnText}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <View style={styles.kpiGrid}>
        <KpiCard
          icon="package"
          label="Minhas viagens"
          value={k.total}
          accent="#60a5fa"
        />
        <KpiCard
          icon="navigation"
          label="Em andamento"
          value={k.open}
          accent="#fbbf24"
        />
        <KpiCard
          icon="check-circle"
          label="Finalizadas"
          value={k.finalized}
          accent="#34d399"
        />
        <KpiCard
          icon="file-text"
          label="Itens a entregar"
          value={k.itemsToDeliver}
          accent="#a78bfa"
        />
      </View>

      {/* ── Próximas entregas ───────────────────────────────────────── */}
      <SectionCard title="Próximas entregas" icon="calendar">
        {upcoming.map((o) => {
          const plates = orderPlates(o);
          const when = o.delivery_date
            ? new Date(o.delivery_date).toLocaleDateString("pt-BR")
            : "—";
          return (
            <View key={o.id} style={styles.listRow}>
              <View style={styles.listIcon}>
                <Feather name="map-pin" size={16} color={accent} />
              </View>
              <View style={styles.listMain}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  Entrega em {when}
                </Text>
                <Text style={styles.listSub} numberOfLines={1}>
                  {plates.length ? plates.join(" • ") : "Sem veículos"}
                </Text>
              </View>
              <StatusBadge label={orderStatusName(o)} />
            </View>
          );
        })}
        {!upcoming.length && (
          <Text style={styles.emptyText}>Nenhuma entrega agendada</Text>
        )}
      </SectionCard>

      {/* ── Distribuição por status (pie) ───────────────────────────── */}
      <SectionCard title="Minhas viagens por status" icon="pie-chart">
        <PieStatusChart
          data={statusSlices}
          centerValue={k.total}
          centerLabel="viagens"
          title="Minhas viagens por status"
        />
      </SectionCard>

      {/* ── Atividade últimos 7 dias ────────────────────────────────── */}
      <SectionCard
        title="Atividade — Últimos 7 dias"
        icon="bar-chart-2"
        hint="Viagens lançadas × finalizadas"
      >
        <DynamicBarChart
          labels={days7.map((d) => d.label)}
          bars={myFinalized}
          line={myCreated}
          barLabel="Finalizadas"
          lineLabel="Lançadas"
          title="Atividade pessoal"
        />
      </SectionCard>

      {/* ── Lista de viagens ────────────────────────────────────────── */}
      <SectionCard title="Viagens" icon="list">
        {fOrders.slice(0, 12).map((o) => {
          const plates = orderPlates(o);
          const items = orderItems(o).length;
          return (
            <View key={o.id} style={styles.listRow}>
              <View style={styles.listIcon}>
                <Feather name="package" size={16} color={accent} />
              </View>
              <View style={styles.listMain}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {plates.length ? plates.join(" • ") : "Sem veículos"}
                </Text>
                <Text style={styles.listSub} numberOfLines={1}>
                  {items} {items === 1 ? "item" : "itens"}
                </Text>
              </View>
              <StatusBadge label={orderStatusName(o)} />
            </View>
          );
        })}
        {!fOrders.length && (
          <Text style={styles.emptyText}>
            Nenhuma viagem encontrada no período filtrado
          </Text>
        )}
      </SectionCard>
    </View>
  );
}
