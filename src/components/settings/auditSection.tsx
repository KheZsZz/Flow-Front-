import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createSettingsStyles } from "@/styles/settings.styles";
import { api } from "@/services/api";
import {
  AuditLogType,
  AUDIT_ENTITY_LABELS,
  AUDIT_ACTION_LABELS,
} from "@/schemas/auditSchema";

const ENTITY_FILTERS = [
  { label: "Todas", value: "" },
  { label: "Usuários", value: "users" },
  { label: "Motoristas", value: "drivers" },
  { label: "Veículos", value: "vehicles" },
  { label: "Viagens", value: "orders" },
  { label: "Coletas", value: "collections" },
  { label: "Notas", value: "invoices" },
  { label: "Clientes", value: "clients" },
  { label: "Status", value: "status" },
  { label: "Abastecimento", value: "fuel" },
  { label: "Metas", value: "goals" },
];

const ACTION_COLOR: Record<string, { bg: string; text: string }> = {
  INSERT: { bg: "#dcfce7", text: "#15803d" },
  UPDATE: { bg: "#e8f0fe", text: "#1a73e8" },
  DELETE: { bg: "#fee2e2", text: "#b91c1c" },
};

export function AuditSection() {
  const { theme } = useTheme();
  const styles = createSettingsStyles(theme, false);

  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [entity, setEntity] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (entityFilter: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (entityFilter) params.append("entity", entityFilter);
      const res = await api.get(`/audit?${params.toString()}`);
      setLogs(res.data ?? []);
    } catch (err) {
      // toast via interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(entity);
  }, [entity]);

  return (
    <View>
      <Text style={styles.sectionTitle}>Histórico de eventos</Text>
      <Text style={styles.sectionHint}>
        Quem criou, alterou ou excluiu registros na empresa.
      </Text>

      {/* ── Filtro por entidade ─────────────────────── */}
      <View style={styles.chipsRow}>
        {ENTITY_FILTERS.map((f) => {
          const active = entity === f.value;
          return (
            <TouchableOpacity
              key={f.value || "all"}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setEntity(f.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : logs.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum evento registrado.</Text>
      ) : (
        logs.map((log) => {
          const color = ACTION_COLOR[log.action] ?? {
            bg: theme.card,
            text: theme.text,
          };
          return (
            <View key={log.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.cardTitle}>
                    {log.summary ??
                      `${AUDIT_ACTION_LABELS[log.action] ?? log.action} em ${
                        AUDIT_ENTITY_LABELS[log.entity] ?? log.entity
                      }`}
                  </Text>
                  <Text style={styles.auditMeta}>
                    {log.actor_name ?? "Sistema"} ·{" "}
                    {new Date(log.created_at).toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: color.bg }]}>
                  <Text style={[styles.badgeText, { color: color.text }]}>
                    {AUDIT_ACTION_LABELS[log.action] ?? log.action}
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
