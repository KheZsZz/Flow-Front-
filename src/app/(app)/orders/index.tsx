import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { collectionService } from "@/services/collections";
import { Loadding } from "@/components/loadding";
import { createCollectionsListStyles } from "@/styles/collections.styles";

interface CollectionRow {
  id: string;
  code: string;
  description?: string;
  scheduled_date?: string;
  created_at?: string;
  finaled_at?: string;
  is_active: boolean;
  status?: { id: string; code: number; name: string };
  clients?: { id: string; name_client: string; document?: string };
}

type DateField = "scheduled_date" | "created_at" | "finaled_at";

const DATE_FIELD_OPTIONS = [
  { label: "Agendada", value: "scheduled_date" },
  { label: "Emissão", value: "created_at" },
  { label: "Finalização", value: "finaled_at" },
];

interface FilterForm {
  search: string;
  dateField: DateField;
  from: string; // ISO (ControlledInput variant="date")
  to: string;
}

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export default function CollectionsListScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width <= 820;
  const styles = createCollectionsListStyles(theme, isMobile);
  const router = useRouter();

  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros via RHF + ControlledInput
  const { control, watch } = useForm<FilterForm>({
    defaultValues: {
      search: "",
      dateField: "scheduled_date",
      from: "",
      to: "",
    },
  });

  const search = watch("search");
  const dateField = watch("dateField");
  const from = watch("from");
  const to = watch("to");

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await collectionService.list();
      setCollections(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as coletas.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (item: CollectionRow) => {
    try {
      await collectionService.toggle(item.id, !item.is_active);
      fetchCollections();
    } catch {
      Alert.alert("Erro", "Não foi possível alterar o status.");
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const filtered = useMemo(() => {
    const q = (search ?? "").trim().toLowerCase();
    const fromD = from ? startOfDay(new Date(from)) : null;
    const toD = to ? endOfDay(new Date(to)) : null;

    return collections.filter((c) => {
      const matchesText =
        !q ||
        c.code?.toLowerCase().includes(q) ||
        c.clients?.name_client?.toLowerCase().includes(q) ||
        c.clients?.document?.toLowerCase().includes(q);
      if (!matchesText) return false;

      if (fromD || toD) {
        const raw = c[dateField];
        if (!raw) return false;
        const d = new Date(raw);
        if (fromD && d < fromD) return false;
        if (toD && d > toD) return false;
      }
      return true;
    });
  }, [collections, search, dateField, from, to]);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString("pt-BR") : "Sem data";

  if (loading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.text} size={50} />
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coletas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/collections/create")}
        >
          <Feather
            name="plus"
            size={24}
            color={theme.isDark ? theme.textSecondary : theme.text}
          />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ControlledInput
        control={control}
        name="search"
        placeholder="Buscar por nº da coleta, cliente ou documento..."
        iconName="magnifying-glass"
      />

      <Text style={styles.filterLabel}>Filtrar por data</Text>
      <ControlledInput
        control={control}
        name="dateField"
        variant="select"
        options={DATE_FIELD_OPTIONS}
      />

      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <ControlledInput
            control={control}
            name="from"
            label="De"
            variant="date"
            iconName="calendar"
          />
        </View>
        <View style={{ flex: 1 }}>
          <ControlledInput
            control={control}
            name="to"
            label="Até"
            variant="date"
            iconName="calendar"
          />
        </View>
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma coleta encontrada.</Text>
      ) : (
        <View style={styles.gridContainer}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.codeText}>{item.code}</Text>
                  <Text style={styles.clientName} numberOfLines={1}>
                    {item.clients?.name_client ?? "Cliente não informado"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: item.is_active
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: item.is_active ? "#22c55e" : "#ef4444" },
                    ]}
                  >
                    {item.is_active ? "Ativa" : "Inativa"}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Feather
                    name="activity"
                    size={14}
                    color={theme.isDark ? "#aaa" : "#666"}
                  />
                  <Text style={styles.infoText}>
                    {item.status?.name ?? "—"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Feather
                    name="calendar"
                    size={14}
                    color={theme.isDark ? "#aaa" : "#666"}
                  />
                  <Text style={styles.infoText}>
                    Agendada: {formatDate(item.scheduled_date)}
                  </Text>
                </View>
                {!!item.finaled_at && (
                  <View style={styles.infoRow}>
                    <Feather
                      name="check-circle"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText}>
                      Finalizada: {formatDate(item.finaled_at)}
                    </Text>
                  </View>
                )}
                {!!item.description && (
                  <View style={styles.infoRow}>
                    <Feather
                      name="file-text"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push(`/collections/edit/${item.id}`)}
                >
                  <Feather
                    name="edit-2"
                    size={14}
                    color={theme.isDark ? "#60a5fa" : "#1a73e8"}
                  />
                  <Text style={styles.editBtnText}>Alterar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: item.is_active ? "#ef4444" : "#22c55e" },
                  ]}
                  onPress={() => toggleStatus(item)}
                >
                  <Feather
                    name={item.is_active ? "slash" : "check-circle"}
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.toggleBtnText}>
                    {item.is_active ? "Inativar" : "Ativar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
