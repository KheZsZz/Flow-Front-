import React from "react";
import { getStatus, toggleStatus } from "@/services/status";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { useEffect, useMemo, useState } from "react";
import { Loadding } from "@/components/loadding";
import {
  useWindowDimensions,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import { SearchField } from "@/components/searchField";
import { StatusTypes } from "@/services/schemas/statusSchematusSchema";
import { useRouter } from "expo-router";
import { createStatusStyles } from "@/styles/status.styles";

export default function SatusScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createStatusStyles(theme, isMobile);

  const [status, setStatus] = useState<StatusTypes[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getStatus();
      setStatus(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (item: StatusTypes) => {
    const turningOff = item.is_active !== false;
    Alert.alert(
      turningOff ? "Inativar status" : "Ativar status",
      `Deseja realmente ${turningOff ? "inativar" : "ativar"} o status "${item.name}"?` +
        (turningOff
          ? "\nStatus inativos deixam de ser usados em novos registros."
          : ""),
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: turningOff ? "destructive" : "default",
          onPress: async () => {
            try {
              await toggleStatus(item.id as string, !turningOff);
              loadData();
            } catch {
              // toast via interceptor
            }
          },
        },
      ],
    );
  };

  const filteredData = useMemo(() => {
    const s = search.toLowerCase();
    return status.filter(
      (item: StatusTypes) =>
        String(item.code).toLowerCase().includes(s) ||
        item.name?.toLowerCase().includes(s) ||
        item.description?.toLowerCase().includes(s),
    );
  }, [search, status]);

  if (loading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.primary} size={50} />
    );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headers}>
          <Text style={styles.title}>Status</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/status/create")}
            style={styles.btn_add}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchField
          placeholder="Pesquisar por código, nome ou descrição..."
          onChange={setSearch}
        />
      </View>
      <ScrollView style={styles.list}>
        {filteredData.map((item, index) => {
          const inactive = item.is_active === false;
          return (
            <View
              key={index}
              style={[styles.listItem, inactive && { opacity: 0.55 }]}
            >
              <View style={styles.listItemContent}>
                <View style={styles.listItemTitleContainer}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemTitle}>{item.code}</Text>
                </View>

                {inactive && (
                  <Text
                    style={{
                      color: "#ef4444",
                      fontSize: 11,
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                  >
                    INATIVO
                  </Text>
                )}

                <Text style={styles.listItemDescription}>
                  Descrição: {item.description}
                </Text>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity
                  style={[styles.icon, styles.editBtn]}
                  onPress={() => router.push(`/(app)/status/edit/${item.id}`)}
                >
                  <Text style={styles.editText}>
                    <Feather name="edit" size={20} /> Editar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleToggle(item)}
                  style={[
                    styles.icon,
                    styles.deleteBtn,
                    { backgroundColor: inactive ? "#22c55e" : "#f59e0b" },
                  ]}
                >
                  <Text style={[styles.deleteText, { color: "#fff" }]}>
                    <Feather
                      name={inactive ? "check-circle" : "slash"}
                      size={20}
                    />{" "}
                    {inactive ? "Ativar" : "Inativar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
