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
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { ClientType } from "@/schemas/clientsSchema";
import { Loadding } from "@/components/loadding";
import { createClientsStyles } from "@/styles/clients.styles";
import { SearchField } from "@/components/searchField";

export default function ClientsListScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width <= 820;
  const styles = createClientsStyles(theme, isMobile);
  const router = useRouter();

  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/clients");
      setClients(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name_client.toLowerCase().includes(lower) ||
        c.document.includes(lower) ||
        c.email?.toLowerCase().includes(lower),
    );
  }, [search, clients]);

  const toggleStatus = async (client: ClientType) => {
    try {
      await api.patch(`/clients/${client.id}`, {
        is_active: !client.is_active,
      });
      fetchClients();
    } catch {}
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.text} size={50} />
    );

  const formatDocument = (doc: string) => {
    const clean = doc.replace(/\D/g, "");
    if (clean.length === 11)
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/clients/create")}
        >
          <Feather name="plus" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <SearchField placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." onChange={setSearch} />

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
      ) : (
        <View style={styles.gridContainer}>
          {filtered.map((client) => (
            <View key={client.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name={
                      client.document.replace(/\D/g, "").length === 14
                        ? "briefcase"
                        : "user"
                    }
                    size={20}
                    color={theme.isDark ? "#60a5fa" : "#1a73e8"}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.clientName}>{client.name_client}</Text>
                  <Text style={styles.clientDoc}>
                    {formatDocument(client.document)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: client.is_active
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: client.is_active ? "#22c55e" : "#ef4444" },
                    ]}
                  >
                    {client.is_active ? "Ativo" : "Inativo"}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                {client.phone && (
                  <View style={styles.infoRow}>
                    <Feather
                      name="phone"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText}>{client.phone}</Text>
                  </View>
                )}
                {client.email && (
                  <View style={styles.infoRow}>
                    <Feather
                      name="mail"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {client.email}
                    </Text>
                  </View>
                )}
                {client.address && (
                  <View style={styles.infoRow}>
                    <Feather
                      name="map-pin"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.addressText} numberOfLines={2}>
                      {client.address.street}, {client.address.number ?? "S/N"}{" "}
                      — {client.address.city}/{client.address.state}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push(`/clients/edit/${client.document}`)
                  }
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
                    {
                      backgroundColor: client.is_active ? "#ef4444" : "#22c55e",
                    },
                  ]}
                  onPress={() => toggleStatus(client)}
                >
                  <Feather
                    name={client.is_active ? "user-x" : "user-check"}
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.toggleBtnText}>
                    {client.is_active ? "Desativar" : "Ativar"}
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
