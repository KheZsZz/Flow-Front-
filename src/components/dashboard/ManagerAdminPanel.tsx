import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { createDashboardStyles } from "@/styles/dashboard.styles";
import {
  KpiCard,
  MiniBars,
  SectionCard,
  StatusBadge,
  FilterChip,
} from "@/components/dashboard/primitives";
import { PieStatusChart } from "@/components/dashboard/charts/PieStatusChart";
import { DynamicBarChart } from "@/components/dashboard/charts/DynamicBarChart";
import { AreaPiecesChart } from "@/components/dashboard/charts/AreaPiecesChart";
import { FunnelOrderChart } from "@/components/dashboard/charts/FunnelOrderChart";
import { GaugeChart } from "@/components/dashboard/charts/GaugeChart";
import { RadarPerformanceChart } from "@/components/dashboard/charts/RadarPerformanceChart";
import { DocumentationStatus } from "@/components/dashboard/documentationStatus";
import {
  dashboardService,
  withinRange,
  countBy,
  recordToBars,
  toSlices,
  sumBy,
  lastNDays,
  bucketByDay,
  buildInvoiceFreightMap,
  orderFreight,
  invoiceFreight,
  orderIsFinalized,
  orderStatusName,
  orderPlates,
  orderDriverName,
  invoiceSituation,
  invoiceValue,
  collectionStatusName,
  collectionIsFinalized,
  formatBRL,
  formatNumber,
  type FuelSummary,
  type VehicleEfficiency,
} from "@/services/dashboard";
import { Loadding } from "../loadding";

type FilterForm = {
  start_date?: string;
  end_date?: string;
  status?: string;
};

export function ManagerAdminPanel({ isMobile }: { isMobile: boolean }) {
  const { theme } = useTheme();
  const styles = createDashboardStyles(theme, isMobile);
  const accent = theme.isDark ? theme.link : theme.primary;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [fuel, setFuel] = useState<FuelSummary>({
    total_spent: 0,
    total_liters: 0,
    avg_price_per_liter: 0,
  });
  const [efficiency, setEfficiency] = useState<VehicleEfficiency[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<string>("TODOS");

  const { control, watch, reset } = useForm<FilterForm>({
    defaultValues: { start_date: undefined, end_date: undefined, status: "" },
  });
  const filters = watch();

  const loadAll = async () => {
    setLoading(true);
    const r = await Promise.allSettled([
      dashboardService.getOrders(),
      dashboardService.getInvoices(),
      dashboardService.getCollections(),
      dashboardService.getFuelSummary(),
      dashboardService.getVehicleEfficiency(),
      dashboardService.getDriverRanking(8),
    ]);
    const [ord, inv, col, sum, eff, rank] = r;
    if (ord.status === "fulfilled") setOrders(ord.value);
    if (inv.status === "fulfilled") setInvoices(inv.value);
    if (col.status === "fulfilled") setCollections(col.value);
    if (sum.status === "fulfilled") setFuel(sum.value);
    if (eff.status === "fulfilled") setEfficiency(eff.value);
    if (rank.status === "fulfilled") setRanking(rank.value);

    const nomes = [
      "orders",
      "invoices",
      "collections",
      "summary",
      "efficiency",
      "ranking",
    ];
    r.forEach(
      (x, i) =>
        x.status === "rejected" &&
        console.warn("[dashboard] falhou:", nomes[i], x.reason),
    );
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dashboardService
      .getFuelSummary({
        start_date: filters.start_date?.slice(0, 10),
        end_date: filters.end_date?.slice(0, 10),
      })
      .then(setFuel)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.start_date, filters.end_date]);

  /* ── Filtragem client-side ──────────────────────────────────────────── */
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

  /* ── Frete ──────────────────────────────────────────────────────────── */
  const freightMap = useMemo(
    () => buildInvoiceFreightMap(invoices),
    [invoices],
  );
  const freightTotal = useMemo(
    () => sumBy(fInvoices, invoiceFreight),
    [fInvoices],
  );

  /* ── KPIs ───────────────────────────────────────────────────────────── */
  const k = useMemo(() => {
    const ordersFinalized = fOrders.filter(orderIsFinalized).length;
    const invWaiting = fInvoices.filter(
      (i) => invoiceSituation(i) === "Aguardando comprovante",
    ).length;
    const invValue = sumBy(fInvoices, invoiceValue);
    const colFinalized = fCollections.filter(collectionIsFinalized).length;
    return {
      ordersTotal: fOrders.length,
      ordersOpen: fOrders.length - ordersFinalized,
      ordersFinalized,
      invTotal: fInvoices.length,
      invWaiting,
      invValue,
      colTotal: fCollections.length,
      colOpen: fCollections.length - colFinalized,
      colFinalized,
    };
  }, [fOrders, fInvoices, fCollections]);

  /* ── Donuts ─────────────────────────────────────────────────────────── */
  const ordersStatusSlices = useMemo(
    () => toSlices(countBy(fOrders, orderStatusName)),
    [fOrders],
  );
  const collectionsStatusSlices = useMemo(
    () => toSlices(countBy(fCollections, collectionStatusName)),
    [fCollections],
  );
  const invoicesSituationBars = useMemo(
    () => recordToBars(countBy(fInvoices, invoiceSituation)),
    [fInvoices],
  );

  /* ── Séries de 7 dias (janela própria, independente do filtro) ──────── */
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
  const collectionsCreated = useMemo(
    () => bucketByDay(collections, (c) => c.created_at, days),
    [collections, days],
  );
  const collectionsFinalized = useMemo(
    () => bucketByDay(collections, (c) => c.finaled_at, days),
    [collections, days],
  );

  /* ── Opções de status ───────────────────────────────────────────────── */
  const statusOptions = useMemo(() => {
    const names = Array.from(new Set(orders.map(orderStatusName)));
    return [
      { label: "Todos os status", value: "" },
      ...names.map((n) => ({ label: n, value: n })),
    ];
  }, [orders]);

  /* ── Funil de viagens ───────────────────────────────────────────────── */
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

  /* ── Tendência de frete (30 dias) ───────────────────────────────────── */
  const freightTrend = useMemo(() => {
    const d30 = lastNDays(30);
    const byDay: number[] = d30.map((day) => {
      const invOfDay = invoices.filter((inv) => {
        const d = inv.created_at?.slice(0, 10);
        return d === day.key;
      });
      return invOfDay.reduce((acc, inv) => acc + (invoiceFreight(inv) || 0), 0);
    });
    return { labels: d30.map((d) => d.label), values: byDay };
  }, [invoices]);

  /* ── Taxa de documentação ───────────────────────────────────────────── */
  const docCompletionRate = useMemo(() => {
    if (!fInvoices.length) return 0;
    const complete = fInvoices.filter(
      (i) => invoiceSituation(i) === "Completa",
    ).length;
    return Math.round((complete / fInvoices.length) * 100);
  }, [fInvoices]);

  /* ── Radar de eficiência da frota ───────────────────────────────────── */
  const fleetRadarData = useMemo(() => {
    const top5 = efficiency.slice(0, 5);
    if (!top5.length) return null;
    const maxKmL = Math.max(1, ...top5.map((e) => Number(e.km_per_liter)));
    const maxKm = Math.max(1, ...top5.map((e) => Number(e.kms_driven)));
    const maxL = Math.max(1, ...top5.map((e) => Number(e.liters)));
    return {
      indicators: [
        { name: "km/L", max: Math.ceil(maxKmL * 1.2) },
        { name: "Km rodados", max: Math.ceil(maxKm * 1.2) },
        { name: "Litros", max: Math.ceil(maxL * 1.2) },
      ],
      series: top5.map((e) => ({
        name: `Veíc. ${String(e.vehicle_id).slice(0, 6)}`,
        values: [
          Number(e.km_per_liter),
          Number(e.kms_driven),
          Number(e.liters),
        ],
      })),
    };
  }, [efficiency]);

  /* ── Eficiência por veículo ─────────────────────────────────────────── */
  const effFiltered = useMemo(() => {
    if (vehicleFilter === "TODOS") return efficiency;
    return efficiency.filter((e) => e.vehicle_id?.startsWith(vehicleFilter));
  }, [efficiency, vehicleFilter]);

  const effBars = useMemo(
    () =>
      effFiltered.map((e) => ({
        label: `Veículo ${String(e.vehicle_id).substring(0, 4)}`,
        value: Number(e.km_per_liter) || 0,
      })),
    [effFiltered],
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

      {/* ── KPIs operacionais ───────────────────────────────────────── */}
      <View style={styles.kpiGrid}>
        <KpiCard
          icon="package"
          label="Viagens"
          value={k.ordersTotal}
          sub={`${k.ordersOpen} em andamento`}
          accent="#60a5fa"
        />
        <KpiCard
          icon="check-circle"
          label="Viagens finalizadas"
          value={k.ordersFinalized}
          accent="#34d399"
        />
        <KpiCard
          icon="dollar-sign"
          label="Valor de frete (CT-e)"
          value={formatBRL(freightTotal)}
          accent="#f97316"
        />
        <KpiCard
          icon="file-text"
          label="Notas fiscais"
          value={k.invTotal}
          sub={`${k.invWaiting} aguardando comprovante`}
          accent="#a78bfa"
        />
        <KpiCard
          icon="box"
          label="Coletas abertas"
          value={k.colOpen}
          sub={`${k.colFinalized} finalizadas`}
          accent="#fbbf24"
        />
        <KpiCard
          icon="tag"
          label="Valor em notas"
          value={formatBRL(k.invValue)}
          accent="#34d399"
        />
      </View>

      {/* ── KPIs de combustível ─────────────────────────────────────── */}
      <View style={styles.kpiGrid}>
        <KpiCard
          icon="trending-down"
          label="Gasto com combustível"
          value={formatBRL(fuel.total_spent)}
          accent="#f87171"
        />
        <KpiCard
          icon="droplet"
          label="Litros abastecidos"
          value={`${formatNumber(fuel.total_liters, 0)} L`}
          accent="#60a5fa"
        />
        <KpiCard
          icon="tag"
          label="Preço médio / litro"
          value={formatBRL(fuel.avg_price_per_liter)}
          accent="#fbbf24"
        />
      </View>

      {/* ── Status de documentação (CT-e / frete / canhoto) ─────────── */}
      <SectionCard
        title="Status de Documentação"
        icon="file-text"
        hint="Notas pendentes de CT-e, valor de frete e canhoto"
        right={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 8,
                height: 12,
                borderRadius: 4,
                backgroundColor: "#34d399",
              }}
            />
            <Text
              style={{ color: theme.isDark ? "#aaa" : "#666", fontSize: 12 }}
            >
              Ao vivo
            </Text>
          </View>
        }
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

      {/* ── Distribuição por status (donut) ─────────────────────────── */}
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

      {/* ── Tendência de receita de frete (30 dias) ─────────────────── */}
      <SectionCard
        title="Receita de frete — 30 dias"
        icon="trending-up"
        hint="Verde acima da média, vermelho abaixo"
      >
        <AreaPiecesChart
          labels={freightTrend.labels}
          values={freightTrend.values}
          title="Receita de frete"
          formatValue={(n) => formatBRL(n)}
        />
      </SectionCard>

      {/* ── Taxa de documentação (gauge) ────────────────────────────── */}
      <SectionCard
        title="Taxa de documentação completa"
        icon="check-square"
        hint="Percentual de NFs com CT-e, frete e canhoto preenchidos"
      >
        <GaugeChart
          value={docCompletionRate}
          label="%"
          title="Documentação completa"
        />
      </SectionCard>

      {/* ── Notas por situação ──────────────────────────────────────── */}
      <SectionCard title="Notas por situação de entrega" icon="file-text">
        <MiniBars
          data={invoicesSituationBars}
          palette={["#34d399", "#fbbf24", "#f87171"]}
        />
      </SectionCard>

      {/* ── Coletas: donut + volume 7 dias ──────────────────────────── */}
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

      <SectionCard
        title="Coletas — Últimos 7 dias"
        icon="bar-chart-2"
        hint="Criadas (barras) × finalizadas (linha)"
      >
        <DynamicBarChart
          labels={dayLabels}
          bars={collectionsCreated}
          line={collectionsFinalized}
          barLabel="Criadas"
          lineLabel="Finalizadas"
          barColor="#fbbf24"
          lineColor="#34d399"
          title="Coletas — Últimos 7 dias"
        />
      </SectionCard>

      {/* ── Radar de eficiência da frota ────────────────────────────── */}
      {fleetRadarData && (
        <SectionCard
          title="Radar de eficiência da frota"
          icon="activity"
          hint="Comparativo km/L, km rodados e consumo por veículo"
        >
          <RadarPerformanceChart
            indicators={fleetRadarData.indicators}
            series={fleetRadarData.series}
            title="Radar de eficiência"
          />
        </SectionCard>
      )}

      {/* ── Eficiência por veículo ──────────────────────────────────── */}
      <SectionCard
        title="Eficiência por veículo (km/L)"
        icon="truck"
        hint="Toque em um veículo para isolar a métrica"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          <FilterChip
            label="Frota completa"
            active={vehicleFilter === "TODOS"}
            onPress={() => setVehicleFilter("TODOS")}
          />
          {efficiency.map((e) => {
            const shortId = String(e.vehicle_id).substring(0, 4);
            return (
              <FilterChip
                key={e.vehicle_id}
                label={`Veículo ${shortId}`}
                active={vehicleFilter === shortId}
                onPress={() => setVehicleFilter(shortId)}
              />
            );
          })}
        </ScrollView>
        <View style={{ height: 12 }} />
        <MiniBars
          data={effBars}
          formatValue={(n) => `${formatNumber(n, 1)} km/L`}
          emptyText="Sem dados de eficiência"
        />
      </SectionCard>

      {/* ── Ranking de motoristas ───────────────────────────────────── */}
      {ranking.length > 0 && (
        <SectionCard title="Ranking de motoristas" icon="award">
          <View style={{ gap: 0 }}>
            {ranking.map((r, i) => {
              const name =
                r.driver_name ?? r.name_user ?? r.name ?? `#${i + 1}`;
              const metric =
                r.total ?? r.score ?? r.deliveries ?? r.km_per_liter ?? null;
              return (
                <View key={i} style={styles.listRow}>
                  <View style={styles.listIcon}>
                    <Text style={{ color: accent, fontWeight: "700" }}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={styles.listMain}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                  {metric !== null && (
                    <Text style={styles.barValue}>
                      {formatNumber(Number(metric), 0)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </SectionCard>
      )}

      {/* ── Viagens recentes (com valor de frete por viagem) ────────── */}
      <SectionCard title="Viagens recentes" icon="clock">
        {fOrders.slice(0, 8).map((o) => {
          const plates = orderPlates(o);
          const freight = orderFreight(o, freightMap);
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
              <View style={{ alignItems: "flex-end", gap: 5 }}>
                <Text style={styles.barValue}>{formatBRL(freight)}</Text>
                <StatusBadge label={orderStatusName(o)} />
              </View>
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
