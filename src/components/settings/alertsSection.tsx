import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Loadding } from "@/components/loadding";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createSettingsStyles } from "@/styles/settings.styles";
import { api } from "@/services/api";
import {
  DocumentAlertType,
  alertSeverity,
  AlertSeverity,
} from "@/schemas/alertsSchema";

const WINDOWS = [7, 15, 30, 60];

const SEVERITY_STYLE: Record<
  AlertSeverity,
  { bg: string; text: string; label: string; icon: string }
> = {
  vencido: { bg: "#fee2e2", text: "#b91c1c", label: "Vencido", icon: "x-circle" },
  critico: {
    bg: "#ffedd5",
    text: "#c2410c",
    label: "Crítico",
    icon: "alert-triangle",
  },
  atencao: {
    bg: "#fef9c3",
    text: "#a16207",
    label: "Atenção",
    icon: "clock",
  },
  ok: { bg: "#dcfce7", text: "#15803d", label: "Em dia", icon: "check-circle" },
};

export function AlertsSection() {
  const { theme } = useTheme();
  const styles = createSettingsStyles(theme, false);

  const [days, setDays] = useState(30);
  const [alerts, setAlerts] = useState<DocumentAlertType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async (window: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/alerts/documents?days=${window}`);
      const data: DocumentAlertType[] = res.data ?? [];
      data.sort((a, b) => a.days_remaining - b.days_remaining);
      setAlerts(data);
    } catch (err) {
      // toast via interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(days);
  }, [days]);

  return (
    <View>
      <Text style={styles.sectionTitle}>Documentos a vencer</Text>
      <Text style={styles.sectionHint}>
        Motoristas (CNH, MOPP) e veículos (CRLV, Seguro, ANTT, Tacógrafo).
      </Text>

      {/* ── Janela ──────────────────────────────────── */}
      <View style={styles.chipsRow}>
        {WINDOWS.map((w) => {
          const active = days === w;
          return (
            <TouchableOpacity
              key={w}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setDays(w)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {w} dias
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <Loadding color={theme.primary} />
      ) : alerts.length === 0 ? (
        <Text style={styles.emptyText}>
          Nenhum documento vencendo nos próximos {days} dias. 🎉
        </Text>
      ) : (
        alerts.map((alert, idx) => {
          const sev = SEVERITY_STYLE[alertSeverity(alert.days_remaining)];
          const isVehicle = alert.entity_kind === "vehicle";
          return (
            <View key={`${alert.entity_id}-${alert.doc_type}-${idx}`} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                  <Feather
                    name={isVehicle ? "truck" : "user"}
                    size={18}
                    color={theme.textSecondary}
                    style={{ marginTop: 2 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{alert.entity_label}</Text>
                    <Text style={styles.cardSub}>
                      {alert.doc_type} · vence em{" "}
                      {new Date(alert.expires_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: sev.bg }]}>
                  <Text style={[styles.badgeText, { color: sev.text }]}>
                    {alert.days_remaining < 0
                      ? `${Math.abs(alert.days_remaining)}d vencido`
                      : `${alert.days_remaining}d`}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
