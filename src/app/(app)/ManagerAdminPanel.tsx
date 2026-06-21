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
import {
  dashboardService,
  withinRange,
  countBy,
  recordToBars,
  sumBy,
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

  /* ── Carga inicial (listas + RPCs) ──────────────────────────────────── */
  const loadAll = async (range?: { start_date?: string; end_date?: string }) => {
    setLoading(true);
    try {
      const [ord, inv, col, sum, eff, rank] = await Promise.all([
        dashboardService.getOrders(),
        dashboardService.getInvoices(),
        dashboardService.getCollections(),
        dashboardService.getFuelSummary(range),
        dashboardService.getVehicleEfficiency(),
        dashboardService.getDriverRanking(8),
      ]);
      setOrders(ord);
      setInvoices(inv);
      setCollections(col);
      setFuel(sum);
      setEfficiency(eff);
      setRanking(rank);
    } catch {
      // o interceptor da api já exibe o toast de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // O resumo de combustível usa filtro real de data no backend.
  useEffect(() => {
    const range = {
      start_date: filters.start_date?.slice(0, 10),
      end_date: filters.end_date?.slice(0, 10),
    };
    dashboardService
      .getFuelSummary(range)
      .then(setFuel)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.start_date, filters.end_date]);

  /* ── Filtragem client-side (data por created_at + status da viagem) ──── */
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

  /* ── KPIs derivados ─────────────────────────────────────────────────── */
  const k = useMemo(() => {
    const ordersFinalized = fOrders.filter(orderIsFinalized).length;
    const ordersOpen = fOrders.length - ordersFinalized;

    const invFinalized = fInvoices.filter(
      (i) => invoiceSituation(i) === "Finalizada",
    ).length;
    const invWaiting = fInvoices.filter(
      (i) => invoiceSituation(i) === "Aguardando comprovante",
    ).length;
    const invValue = sumBy(fInvoices, invoiceValue);

    const colFinalized = fCollections.filter(collectionIsFinalized).length;
    const colOpen = fCollections.length - colFinalized;

    return {
      ordersTotal: fOrders.length,
      ordersOpen,
      ordersFinalized,
      invTotal: fInvoices.length,
      invFinalized,
      invWaiting,
      invValue,
      colTotal: fCollections.length,
      colOpen,
      colFinalized,
    };
  }, [fOrders, fInvoices, fCollections]);

  /* ── Breakdowns para as MiniBars ────────────────────────────────────── */
  const ordersByStatus = useMemo(
    () => recordToBars(countBy(fOrders, orderStatusName)),
    [fOrders],
  );
  const invoicesBySituation = useMemo(
    () => recordToBars(countBy(fInvoices, invoiceSituation)),
    [fInvoices],
  );
  const collectionsByStatus = useMemo(
    () => recordToBars(countBy(fCollections, collectionStatusName)),
    [fCollections],
  );

  /* ── Opções de status para o filtro (derivadas do dado real) ────────── */
  const statusOptions = useMemo(() => {
    const names = Array.from(new Set(orders.map(orderStatusName)));
    return [
      { label: "Todos os status", value: "" },
      ...names.map((n) => ({ label: n, value: n })),
    ];
  }, [orders]);

  /* ── Eficiência por veículo (com filtro de chips) ───────────────────── */
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={styles.emptyText}>Carregando o painel…</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 18 }}>
      {/* ── Filtros interativos ─────────────────────────────────────── */}
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
          icon="box"
          label="Coletas abertas"
          value={k.colOpen}
          sub={`${k.colFinalized} finalizadas`}
          accent="#fbbf24"
        />
        <KpiCard
          icon="file-text"
          label="Notas fiscais"
          value={k.invTotal}
          sub={`${k.invWaiting} aguardando comprovante`}
          accent="#a78bfa"
        />
        <KpiCard
          icon="dollar-sign"
          label="Valor em notas"
          value={formatBRL(k.invValue)}
          accent="#34d399"
        />
      </View>

      {/* ── KPIs de combustível (RPC com filtro de data real) ───────── */}
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

      {/* ── Breakdowns ──────────────────────────────────────────────── */}
      <SectionCard
        title="Viagens por status"
        icon="bar-chart-2"
        hint="Distribuição das viagens no período filtrado"
      >
        <MiniBars data={ordersByStatus} />
      </SectionCard>

      <SectionCard
        title="Notas por situação de entrega"
        icon="file-text"
      >
        <MiniBars
          data={invoicesBySituation}
          palette={["#34d399", "#fbbf24", "#f87171"]}
        />
      </SectionCard>

      <SectionCard title="Coletas por status" icon="box">
        <MiniBars data={collectionsByStatus} />
      </SectionCard>

      {/* ── Eficiência por veículo (com filtro de chips) ────────────── */}
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

      {/* ── Ranking de motoristas (defensivo quanto ao shape) ───────── */}
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

      {/* ── Atividade recente ───────────────────────────────────────── */}
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
