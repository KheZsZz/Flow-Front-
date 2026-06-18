import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createSettingsStyles } from "@/styles/settings.styles";
import { ControlledInput } from "@/components/controllerInput";
import { api } from "@/services/api";
import {
  goalSchema,
  GoalType,
  GOAL_METRIC_LABELS,
  GOAL_METRIC_OPTIONS,
  GOAL_PERIOD_OPTIONS,
} from "@/schemas/goalsSchema";

type GoalRow = {
  id: string;
  user_id: string;
  user_name?: string;
  metric: string;
  target_value: number;
  period: string;
  is_active: boolean;
};

type UserOption = { label: string; value: string };

export function GoalsSection() {
  const { theme } = useTheme();
  const styles = createSettingsStyles(theme, false);

  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalType>({
    resolver: zodResolver(goalSchema),
    defaultValues: { period: "Diária", is_active: true },
  });

  const fetchData = async () => {
    try {
      const [goalsRes, usersRes] = await Promise.all([
        api.get("/goals"),
        api.get("/users"),
      ]);
      setGoals(goalsRes.data ?? []);
      setUsers(
        (usersRes.data ?? []).map((u: any) => ({
          label: u.name_user,
          value: u.id,
        })),
      );
    } catch (err) {
      // toast via interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: GoalType) => {
    setSaving(true);
    try {
      await api.post("/goals", data);
      Alert.alert("Sucesso", "Meta criada!");
      reset({ period: "Diária", is_active: true });
      setShowForm(false);
      fetchData();
    } catch (err) {
      // toast via interceptor
    } finally {
      setSaving(false);
    }
  };

  const removeGoal = (goal: GoalRow) => {
    Alert.alert("Remover meta", "Deseja remover esta meta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/goals/${goal.id}`);
            fetchData();
          } catch (err) {
            // toast via interceptor
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.cardRow, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Metas dos usuários</Text>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setShowForm((s) => !s)}
        >
          <Feather
            name={showForm ? "x" : "plus"}
            size={16}
            color={theme.link}
          />
          <Text style={styles.secondaryBtnText}>
            {showForm ? "Cancelar" : "Nova meta"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Formulário ──────────────────────────────── */}
      {showForm && (
        <View style={styles.card}>
          <ControlledInput
            control={control}
            name="user_id"
            label="Usuário"
            variant="select"
            options={users}
            errorMessage={errors.user_id?.message as string}
          />
          <ControlledInput
            control={control}
            name="metric"
            label="Métrica"
            variant="select"
            options={GOAL_METRIC_OPTIONS}
            errorMessage={errors.metric?.message as string}
          />
          <ControlledInput
            control={control}
            name="target_value"
            label="Meta (valor)"
            placeholder="Ex: 10"
            variant="numeric"
            errorMessage={errors.target_value?.message as string}
          />
          <ControlledInput
            control={control}
            name="period"
            label="Período"
            variant="select"
            options={GOAL_PERIOD_OPTIONS}
            errorMessage={errors.period?.message as string}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Criar meta</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Lista ───────────────────────────────────── */}
      {goals.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma meta definida ainda.</Text>
      ) : (
        goals.map((goal) => (
          <View key={goal.id} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {goal.user_name ?? "Usuário"}
                </Text>
                <Text style={styles.cardSub}>
                  {GOAL_METRIC_LABELS[goal.metric] ?? goal.metric} ·{" "}
                  {goal.period} · meta {goal.target_value}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={() => removeGoal(goal)}
              >
                <Feather name="trash-2" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
