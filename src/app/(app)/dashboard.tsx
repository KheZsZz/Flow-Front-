import React, { useEffect, useState, lazy, Suspense } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { usePermissions } from "@/hooks/usePermission";
import { createDashboardStyles } from "@/styles/dashboard.styles";
import { ROLE_LABEL, ROLE_COLOR } from "@/constants/colors";
import { UserTypeEnum } from "@/services/schemas/enumSchemanumSchema";
import { ErrorBoundary } from "@/components/errorBoundary";
import {
  KpiCard,
  SectionCard,
  MiniBars,
} from "@/components/dashboard/primitives";
import {
  dashboardService,
  countBy,
  recordToBars,
  sumBy,
  orderIsFinalized,
  orderStatusName,
  invoiceSituation,
  invoiceValue,
  collectionIsFinalized,
  formatBRL,
} from "@/services/dashboard";
import { Loadding } from "@/components/loadding";

const ManagerAdminPanel = lazy(() =>
  import("@/components/dashboard/ManagerAdminPanel").then((m) => ({
    default: m.ManagerAdminPanel,
  })),
);
const CommumPanel = lazy(() =>
  import("@/components/dashboard/CommumPanel").then((m) => ({
    default: m.CommumPanel,
  })),
);

function OperationalFallback({ isMobile }: { isMobile: boolean }) {
  const { theme } = useTheme();
  const styles = createDashboardStyles(theme, isMobile);
  const accent = theme.isDark ? theme.link : theme.primary;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

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

  if (loading) return <Loadding color={accent} size={50} />;

  const invValue = sumBy(invoices, invoiceValue);
  const invWaiting = invoices.filter(
    (i) => invoiceSituation(i) === "Aguardando comprovante",
  ).length;
  const colOpen = collections.filter((c) => !collectionIsFinalized(c)).length;
  const ordersOpen = orders.filter((o) => !orderIsFinalized(o)).length;

  return (
    <View style={{ gap: 18 }}>
      <View style={styles.kpiGrid}>
        <KpiCard
          icon="package"
          label="Viagens em andamento"
          value={ordersOpen}
          accent="#60a5fa"
        />
        <KpiCard
          icon="file-text"
          label="Notas aguardando comprovante"
          value={invWaiting}
          accent="#fbbf24"
        />
        <KpiCard
          icon="box"
          label="Coletas abertas"
          value={colOpen}
          accent="#a78bfa"
        />
        <KpiCard
          icon="dollar-sign"
          label="Valor em notas"
          value={formatBRL(invValue)}
          accent="#34d399"
        />
      </View>

      <SectionCard title="Notas por situação de entrega" icon="file-text">
        <MiniBars
          data={recordToBars(countBy(invoices, invoiceSituation))}
          palette={["#34d399", "#fbbf24", "#f87171"]}
        />
      </SectionCard>

      <SectionCard title="Viagens por status" icon="bar-chart-2">
        <MiniBars data={recordToBars(countBy(orders, orderStatusName))} />
      </SectionCard>
    </View>
  );
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { profile, hasMinRole } = usePermissions();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createDashboardStyles(theme, isMobile);

  const role = profile as UserTypeEnum;
  const roleColor = ROLE_COLOR[role] ?? "#999999";
  const roleLabel = ROLE_LABEL[role] ?? role;
  const isAdmin = hasMinRole("Admin");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Painel</Text>
            <Text style={styles.subtitle}>
              Olá, {user?.user?.name_user ?? "usuário"} — visão geral da
              operação
            </Text>
          </View>
          <View
            style={[
              styles.roleTag,
              {
                backgroundColor: roleColor + "22",
                borderColor: roleColor + "55",
              },
            ]}
          >
            <Text style={[styles.roleTagText, { color: roleColor }]}>
              {roleLabel}
            </Text>
          </View>
        </View>

        <ErrorBoundary>
          <Suspense fallback={<Loadding color={roleColor} size={50} />}>
            {isAdmin ? (
              <ManagerAdminPanel isMobile={isMobile} />
            ) : profile === "Commum" ? (
              <CommumPanel isMobile={isMobile} />
            ) : (
              <OperationalFallback isMobile={isMobile} />
            )}
          </Suspense>
        </ErrorBoundary>
      </ScrollView>
    </View>
  );
}
