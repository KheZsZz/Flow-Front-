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

export interface PickerOption {
  id: string;
  label: string;
  sublabel?: string;
  raw?: any;
}

export function PickerModal({
  visible,
  title,
  load,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  load: () => Promise<PickerOption[]>;
  onClose: () => void;
  onSelect: (opt: PickerOption) => void;
}) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<PickerOption[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setSearch("");
    (async () => {
      setLoading(true);
      try {
        const data = await load();
        if (active) setOptions(Array.isArray(data) ? data : []);
      } catch {
        if (active) setOptions([]);
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
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label?.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q),
    );
  }, [options, search]);

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
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 12 }}>
            <TextInput
              placeholder="Buscar..."
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
                  Nada encontrado.
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
                    {item.label}
                  </Text>
                  {!!item.sublabel && (
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {item.sublabel}
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
