import React, { useMemo, useState } from "react";
import {
  useWindowDimensions,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/themeContext";
import { InvoiceList } from "@/components/invoices/invoicesList";
import { InvoiceTypes } from "@/schemas/invoicesSchema";
import { createInvoiceListStyles } from "@/styles/invoices.styles";
import { Loadding } from "@/components/loadding";
import { SearchField } from "@/components/searchField";
import { useInvoices, listKeys } from "@/hooks/querys/useListData";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

export default function InvoiceScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createInvoiceListStyles(theme, isMobile);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const { data: invoices = [], isLoading, isFetching, refetch } = useInvoices();
  useRefreshOnFocus(refetch);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: listKeys.invoices });

  const filteredData = useMemo(() => {
    const s = search.toLowerCase();
    return invoices.filter(
      (item: InvoiceTypes) =>
        item.cte?.toLowerCase().includes(s) ||
        item.nfe?.toLowerCase().includes(s) ||
        item.remetente?.name_client?.toLowerCase().includes(s),
    );
  }, [search, invoices]);

  if (isLoading)
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
        <SearchField
          placeholder="Pesquisar por CTE, NFE ou remetente..."
          onChange={setSearch}
        />
      </View>

      <View style={{ flex: 1 }}>
        <InvoiceList
          data={filteredData}
          loading={isFetching}
          onRefresh={invalidate}
          onDeleteSuccess={invalidate}
        />
      </View>
    </View>
  );
}
