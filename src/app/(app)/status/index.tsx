import React from "react";
import { getStatus } from "@/services/status";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { useEffect, useMemo, useState } from "react";
import { Loadding } from "@/components/loadding";
import {
  useWindowDimensions,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
} from "react-native";
import { StatusTypes } from "@/schemas/statusSchema";
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
    const data = await getStatus();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const s = search.toLowerCase();
    return status.filter(
      (item: StatusTypes) =>
        String(item.code).toLowerCase().includes(s) ||
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

        <TextInput
          placeholder="Pesquisar..."
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView style={styles.list}>
        {filteredData.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemTitleContainer}>
                <Text style={styles.listItemTitle}>{item.code}</Text>
                <Text style={styles.listItemTitle}>{item.name}</Text>
              </View>

              <Text style={styles.listItemDescription}>
                Description: {item.description}
              </Text>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={[styles.icon, { backgroundColor: theme.primary }]}
                onPress={() => router.push(`/(app)/status/edit/${item.id}`)}
              >
                <Feather
                  name="edit"
                  size={24}
                  color={
                    theme.isDark ? theme.textSecondary : theme.textSecondary
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {}}
                style={[styles.icon, { backgroundColor: theme.error }]}
              >
                <Feather name="trash-2" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
