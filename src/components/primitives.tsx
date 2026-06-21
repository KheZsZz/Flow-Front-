import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createDashboardStyles } from "@/styles/dashboard.styles";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

/* ── KPI Card ──────────────────────────────────────────────────────────── */
export function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: FeatherName;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createDashboardStyles(theme, isMobile);
  const color = accent ?? (theme.isDark ? theme.link : theme.primary);

  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiTop}>
        <View
          style={[styles.kpiIconWrap, { backgroundColor: color + "22" }]}
        >
          <Feather name={icon} size={18} color={color} />
        </View>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {!!sub && <Text style={styles.kpiSub}>{sub}</Text>}
    </View>
  );
}

/* ── Barras horizontais (visual em View, sem libs de gráfico) ──────────── */
export type BarDatum = { label: string; value: number; color?: string };

export function MiniBars({
  data,
  palette,
  formatValue,
  emptyText = "Sem dados no período",
}: {
  data: BarDatum[];
  palette?: string[];
  formatValue?: (n: number) => string;
  emptyText?: string;
}) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createDashboardStyles(theme, isMobile);

  const defaultPalette = [
    theme.isDark ? theme.link : theme.primary,
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#a78bfa",
    "#60a5fa",
  ];
  const colors = palette ?? defaultPalette;
  const max = Math.max(1, ...data.map((d) => d.value));

  if (!data.length) {
    return <Text style={styles.emptyText}>{emptyText}</Text>;
  }

  return (
    <View style={{ gap: 14 }}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / max) * 100);
        const color = d.color ?? colors[i % colors.length];
        return (
          <View key={`${d.label}-${i}`} style={styles.barRow}>
            <View style={styles.barTopLine}>
              <Text style={styles.barLabel} numberOfLines={1}>
                {d.label}
              </Text>
              <Text style={styles.barValue}>
                {formatValue ? formatValue(d.value) : d.value}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${pct}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ── Section Card ──────────────────────────────────────────────────────── */
export function SectionCard({
  title,
  icon,
  hint,
  right,
  children,
}: {
  title: string;
  icon?: FeatherName;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createDashboardStyles(theme, isMobile);
  const accent = theme.isDark ? theme.link : theme.primary;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionTitleRow}>
          {!!icon && <Feather name={icon} size={16} color={accent} />}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {right}
      </View>
      {!!hint && <Text style={styles.sectionHint}>{hint}</Text>}
      {children}
    </View>
  );
}

/* ── Status badge (usa o mapa de cores de status do tema quando existir) ─ */
export function StatusBadge({ label }: { label: string }) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createDashboardStyles(theme, isMobile);

  const mapped = (theme.status as any)?.[label];
  const bg = mapped?.bg ?? (theme.isDark ? "#1e2640" : "#eef2f7");
  const text = mapped?.text ?? (theme.isDark ? "#cbd5e1" : "#475569");

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusBadgeText, { color: text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ── Chip de filtro (veículo etc.) ─────────────────────────────────────── */
export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createDashboardStyles(theme, isMobile);
  const accent = theme.isDark ? theme.link : theme.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? accent : "transparent",
          borderColor: active ? accent : theme.borderColor,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? "#fff" : theme.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
