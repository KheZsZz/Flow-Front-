import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { createDashboardStyles } from "@/styles/dashboard.styles";
import {
  KpiCard,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard/primitives";
import { PieStatusChart } from "@/components/dashboard/charts/PieStatusChart";
import { DynamicBarChart } from "@/components/dashboard/charts/DynamicBarChart";
import { FunnelOrderChart } from "@/components/dashboard/charts/FunnelOrderChart";
import { DocumentationStatus } from "@/components/dashboard/documentationStatus";
import {
  dashboardService,
  withinRange,
  countBy,
  toSlices,
  lastNDays,
  bucketByDay,
  orderIsFinalized,
  orderStatusName,
  orderPlates,
  orderDriverName,
  collectionStatusName,
  collectionIsFinalized,
} from "@/services/dashboard";
import { Loadding } from "../loadding";

type FilterForm = {
  start_date?: string;
  end_date?: string;
  status?: string;
};

export function CommumPanel({ isMobile }: { isMobile: boolean }) {
  const { theme } = useTheme();
  const styles = createDashboardStyles(theme, isMobile);
  const accent = theme.isDark ? theme.link : theme.primary;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  const { control, watch, reset } = useForm<FilterForm>({
    defaultValues: { start_date: undefined, end_date: undefined, status: "" },
  });
  const filters = watch();

  useEffect(() => {
    Promise.all([
      dashboardService.getOrders(),
      dashboardService.getInvoices(),
      dashboardService.getCollections(),
    ])
      .then(([o, i, c]) => {
        setOrders(o);
        setInvoices(i);
        setCollections(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fOrders = useMemo(
    () =>
      orders
        .filter((o) =>
          withinRange(o.created_at, filters.start_date, filters.end_date),
        )
        .filter((o) =>
          filters.status ? orderStatusName(o) === filters.status : true,
        ),
    [orders, filters.start_date, filters.end_date, filters.status],
  );

  const fInvoices = useMemo(
    () =>
      invoices.filter((i) =>
        withinRange(i.created_at, filters.start_date, filters.end_date),
      ),
    [invoices, filters.start_date, filters.end_date],
  );

  const fCollections = useMemo(
    () =>
      collections.filter((c) =>
        withinRange(c.created_at, filters.start_date, filters.end_date),
      ),
    [collections, filters.start_date, filters.end_date],
  );

  const k = useMemo(() => {
    const ordersFinalized = fOrders.filter(orderIsFinalized).length;
    const colFinalized = fCollections.filter(collectionIsFinalized).length;
    return {
      ordersTotal: fOrders.length,
      ordersFinalized,
      colTotal: fCollections.length,
      colOpen: fCollections.length - colFinalized,
      invTotal: fInvoices.length,
    };
  }, [fOrders, fInvoices, fCollections]);

  const ordersStatusSlices = useMemo(
    () => toSlices(countBy(fOrders, orderStatusName)),
    [fOrders],
  );
  const collectionsStatusSlices = useMemo(
    () => toSlices(countBy(fCollections, collectionStatusName)),
    [fCollections],
  );

  const days = useMemo(() => lastNDays(7), []);
  const dayLabels = days.map((d) => d.label);
  const ordersCreated = useMemo(
    () => bucketByDay(orders, (o) => o.created_at, days),
    [orders, days],
  );
  const ordersDelivered = useMemo(
    () => bucketByDay(orders, (o) => o.finaled_at, days),
    [orders, days],
  );

  const funnelStages = useMemo(() => {
    const created = fOrders.length;
    const started = fOrders.filter((o) => {
      const s = orderStatusName(o).toLowerCase();
      return s !== "criada" && s !== "pendente";
    }).length;
    const finalized = fOrders.filter(orderIsFinalized).length;
    return [
      { name: "Criadas", value: created, color: "#60a5fa" },
      { name: "Em andamento", value: started, color: "#fbbf24" },
      { name: "Finalizadas", value: finalized, color: "#34d399" },
    ];
  }, [fOrders]);

  const statusOptions = useMemo(() => {
    const names = Array.from(new Set(orders.map(orderStatusName)));
    return [
      { label: "Todos os status", value: "" },
      ...names.map((n) => ({ label: n, value: n })),
    ];
  }, [orders]);

  const hasFilters =
    !!filters.start_date || !!filters.end_date || !!filters.status;

  if (loading) return <Loadding color={accent} size={50} />;

  return (
    <View style={{ gap: 18 }}>
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
          label="Status da viagem"
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

      {/* ── KPIs (sem valores financeiros) ──────────────────────────── */}
      <View style={styles.kpiGrid}>
        <KpiCard
          icon="package"
          label="Total de viagens"
          value={k.ordersTotal}
          accent="#60a5fa"
        />
        <KpiCard
          icon="check-circle"
          label="Viagens finalizadas"
          value={k.ordersFinalized}
          accent="#34d399"
        />
        <KpiCard
          icon="box"
          label="Coletas abertas"
          value={k.colOpen}
          accent="#fbbf24"
        />
        <KpiCard
          icon="file-text"
          label="Total de notas fiscais"
          value={k.invTotal}
          accent="#a78bfa"
        />
      </View>

      {/* ── Status de documentação ──────────────────────────────────── */}
      <SectionCard
        title="Status de Documentação"
        icon="file-text"
        hint="Notas pendentes de CT-e, valor de frete e canhoto"
      >
        <DocumentationStatus invoices={fInvoices} />
      </SectionCard>

      {/* ── Funil de viagens ────────────────────────────────────────── */}
      <SectionCard
        title="Funil de viagens"
        icon="filter"
        hint="Criadas → Em andamento → Finalizadas"
      >
        <FunnelOrderChart stages={funnelStages} title="Funil de viagens" />
      </SectionCard>

      {/* ── Distribuição por status (viagens) ───────────────────────── */}
      <SectionCard
        title="Distribuição por status"
        icon="pie-chart"
        hint="Viagens por status no período filtrado"
      >
        <PieStatusChart
          data={ordersStatusSlices}
          centerValue={k.ordersTotal}
          centerLabel="viagens"
          title="Distribuição por status"
        />
      </SectionCard>

      {/* ── Coletas por status ──────────────────────────────────────── */}
      <SectionCard
        title="Coletas por status"
        icon="pie-chart"
        hint="Distribuição das coletas no período filtrado"
      >
        <PieStatusChart
          data={collectionsStatusSlices}
          centerValue={k.colTotal}
          centerLabel="coletas"
          title="Coletas por status"
        />
      </SectionCard>

      {/* ── Volume últimos 7 dias ───────────────────────────────────── */}
      <SectionCard
        title="Volume — Últimos 7 dias"
        icon="bar-chart-2"
        hint="Viagens entregues (barras) × lançadas (linha)"
      >
        <DynamicBarChart
          labels={dayLabels}
          bars={ordersDelivered}
          line={ordersCreated}
          barLabel="Entregues"
          lineLabel="Lançadas"
          title="Volume — Últimos 7 dias"
        />
      </SectionCard>

      {/* ── Viagens recentes (sem valor de frete) ───────────────────── */}
      <SectionCard title="Viagens recentes" icon="clock">
        {fOrders.slice(0, 8).map((o) => {
          const plates = orderPlates(o);
          return (
            <View key={o.id} style={styles.listRow}>
              <View style={styles.listIcon}>
                <Feather name="package" size={16} color={accent} />
              </View>
              <View style={styles.listMain}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {orderDriverName(o)}
                </Text>
                <Text style={styles.listSub} numberOfLines={1}>
                  {plates.length ? plates.join(" • ") : "Sem veículos"}
                </Text>
              </View>
              <StatusBadge label={orderStatusName(o)} />
            </View>
          );
        })}
        {!fOrders.length && (
          <Text style={styles.emptyText}>
            Nenhuma viagem no período filtrado
          </Text>
        )}
      </SectionCard>
    </View>
  );
}
