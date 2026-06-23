import React from "react";
import { InvoiceList } from "@/components/invoicesList";
import { InvoiceTypes } from "@/schemas/invoicesSchema";
import { invoiceService } from "@/services/invoices";
import { createInvoiceListStyles } from "@/styles/invoices.styles";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions, View, TouchableOpacity, Text } from "react-native";
import { Loadding } from "@/components/loadding";
import { SearchField } from "@/components/searchField";

export default function InvoiceScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createInvoiceListStyles(theme, isMobile);

  const [invoices, setInvoices] = useState<InvoiceTypes[]>([]);
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
    const s = search.toLowerCase();
    return invoices.filter(
      (item: InvoiceTypes) =>
        item.cte?.toLowerCase().includes(s) ||
        item.nfe?.toLowerCase().includes(s) ||
        item.remetente?.name_client?.toLowerCase().includes(s),
    );
  }, [search, invoices]);

  if (loading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.primary} size={50} />
    );
  return (
    <View style={styles.container}>
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
        <SearchField placeholder="Pesquisar por CTE, NFE ou remetente..." onChange={setSearch} />
      </View>

      <View style={{ flex: 1 }}>
        <InvoiceList
          data={filteredData}
          loading={loading}
          onRefresh={loadData}
          onDeleteSuccess={loadData}
        />
      </View>
    </View>
  );
}

