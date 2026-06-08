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
import { createInvoiceListStyles } from "@/styles/invoices.styles";

export default function InvoiceScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createInvoiceListStyles(theme);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headers}>
          <Text style={styles.title}>Notas Fiscais</Text>

          <TouchableOpacity
            onPress={() => router.push("/(app)/invoices/upload")}
            style={styles.btn_add}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Pesquisar NFe, Cliente ou CTe..."
          placeholderTextColor={theme.isDark ? theme.textSecondary : theme.text}
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <InvoiceList data={filteredData} loading={loading} onRefresh={loadData} />
    </SafeAreaView>
  );
}
