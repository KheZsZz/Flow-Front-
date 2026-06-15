import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";

export interface PickedClient {
  id: string;
  name_client: string;
  document?: string;
}

export function ClientPickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (client: PickedClient) => void;
}) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<PickedClient[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/clients");
        if (active) setClients(Array.isArray(data) ? data : []);
      } catch {
        if (active) setClients([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [visible]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name_client?.toLowerCase().includes(q) ||
        c.document?.toLowerCase().includes(q),
    );
  }, [clients, search]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 14,
            maxHeight: "80%",
            overflow: "hidden",
            borderWidth: 1,
            borderColor: theme.borderColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.borderColor,
            }}
          >
            <Text
              style={{ color: theme.text, fontSize: 16, fontWeight: "bold" }}
            >
              Selecionar cliente
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 12 }}>
            <TextInput
              placeholder="Buscar por nome ou documento..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.borderColor,
                paddingHorizontal: 12,
                height: 44,
              }}
            />
          </View>

          {loading ? (
            <ActivityIndicator
              style={{ paddingVertical: 30 }}
              color={theme.primary}
            />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text
                  style={{
                    color: theme.textSecondary,
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  Nenhum cliente encontrado.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.borderColor,
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: "600" }}>
                    {item.name_client}
                  </Text>
                  {!!item.document && (
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {item.document}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
