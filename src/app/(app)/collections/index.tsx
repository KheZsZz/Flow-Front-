import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
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
  in_order?: boolean; // <-- NOVO (vem do backend)
  status?: { id: string; code: number; name: string };
  clients?: { id: string; name_client: string; document?: string };
}

type DateField = "scheduled_date" | "created_at" | "finaled_at";

const DATE_FIELDS: { key: DateField; label: string }[] = [
  { key: "scheduled_date", label: "Agendada" },
  { key: "created_at", label: "Emissão" },
  { key: "finaled_at", label: "Finalização" },
];

// "DD/MM/AAAA" -> Date (ou null se incompleto/inválido)
function parseBR(value: string): Date | null {
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dt = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(dt.getTime()) ? null : dt;
}

export default function CollectionsListScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width <= 820;
  const styles = createCollectionsListStyles(theme, isMobile);
  const router = useRouter();

  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [dateField, setDateField] = useState<DateField>("scheduled_date");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await collectionService.list();
      setCollections(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (item: CollectionRow) => {
    try {
      await collectionService.toggle(item.id, !item.is_active);
      fetchCollections();
    } catch {}
  };

  const handleDelete = (item: CollectionRow) => {
    Alert.alert(
      "Excluir coleta",
      `Deseja excluir a coleta ${item.code}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await collectionService.remove(item.id);
              fetchCollections();
            } catch (e: any) {}
          },
        },
      ],
    );
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromD = parseBR(from);
    const toD = parseBR(to);
    const toEnd = toD
      ? new Date(toD.getFullYear(), toD.getMonth(), toD.getDate(), 23, 59, 59)
      : null;

    return collections.filter((c) => {
      const matchesText =
        !q ||
        c.code?.toLowerCase().includes(q) ||
        c.clients?.name_client?.toLowerCase().includes(q) ||
        c.clients?.document?.toLowerCase().includes(q);
      if (!matchesText) return false;

      if (fromD || toEnd) {
        const raw = c[dateField];
        if (!raw) return false;
        const d = new Date(raw);
        if (fromD && d < fromD) return false;
        if (toEnd && d > toEnd) return false;
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
          <Feather name="plus" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Busca: número da coleta / cliente / documento */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color={theme.isDark ? theme.textSecondary : theme.text}
        />
        <TextInput
          placeholder="Buscar por nº da coleta, cliente ou documento..."
          placeholderTextColor={theme.isDark ? theme.textSecondary : theme.text}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Seletor de qual data filtrar */}
      <Text style={styles.filterLabel}>Filtrar por data</Text>
      <View style={styles.chipsRow}>
        {DATE_FIELDS.map((f) => {
          const active = dateField === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setDateField(f.key)}
            >
              <Text style={active ? styles.chipTextActive : styles.chipText}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Intervalo de datas aplicado ao campo selecionado */}
      <View style={styles.dateRow}>
        <TextInput
          placeholder="De  DD/MM/AAAA"
          placeholderTextColor={theme.isDark ? theme.textSecondary : theme.text}
          style={styles.dateInput}
          value={from}
          onChangeText={setFrom}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Até  DD/MM/AAAA"
          placeholderTextColor={theme.isDark ? theme.textSecondary : theme.text}
          style={styles.dateInput}
          value={to}
          onChangeText={setTo}
          keyboardType="numeric"
        />
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
