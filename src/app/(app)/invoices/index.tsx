import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { InvoiceList } from "@/components/invoicesList";
import { invoiceService } from "@/services/invoices";
import { useTheme } from "@/contexts/themeContext";

export default function InvoiceScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return invoices.filter(
      (item: any) =>
        item.nfe?.toLowerCase().includes(search.toLowerCase()) ||
        item.remetente?.name_client
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.destinatario?.name_client
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.cte?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, invoices]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Container superior com padding extra para não sobrepor o botão de tema */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "ios" ? 10 : 45,
          paddingBottom: 10,
        }}
      >
        {/* Header: Título e Botão de Adicionar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: "bold" }}>
            Notas Fiscais
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(app)/invoices/upload")}
            style={{
              backgroundColor: theme.primary,
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Campo de pesquisa unificado */}
        <TextInput
          placeholder="Pesquisar NFe, Cliente ou CTe..."
          placeholderTextColor={theme.textSecondary}
          style={{
            backgroundColor: theme.card,
            padding: 15,
            borderRadius: 12,
            color: theme.text,
            fontSize: 16,
          }}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Lista de notas */}
      <InvoiceList data={filteredData} loading={loading} onRefresh={loadData} />
    </SafeAreaView>
  );
}
