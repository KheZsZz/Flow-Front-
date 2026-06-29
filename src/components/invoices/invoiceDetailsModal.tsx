import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { formatCurrency, formatCurrencyCTe } from "@/services/formatMoney";

const isHttp = (url?: string) => !!url && /^https?:\/\//.test(url);

const openUrl = async (url?: string) => {
  if (!isHttp(url)) return;
  try {
    if (Platform.OS === "web") {
      window.open(url as string, "_blank");
    } else {
      await Linking.openURL(url as string);
    }
  } catch {
    // silencioso — o usuário pode tentar de novo
  }
};

function Row({ label, value, theme }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor,
        gap: 12,
      }}
    >
      <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text
        style={{
          color: theme.text,
          fontSize: 13,
          fontWeight: "600",
          flexShrink: 1,
          textAlign: "right",
        }}
      >
        {value === null || value === undefined || value === "" ? "—" : value}
      </Text>
    </View>
  );
}

function DownloadBtn({ label, icon, onPress, theme }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
      }}
    >
      <Feather
        name={icon}
        size={16}
        color={theme.isDark ? "#60a5fa" : "#1a73e8"}
      />
      <Text
        style={{ color: theme.isDark ? "#60a5fa" : "#1a73e8", fontWeight: "600" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function InvoiceDetailsModal({ visible, invoice, onClose }: any) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 820;

  if (!invoice) return null;

  const hasNfe = isHttp(invoice.xml_nfe_url);
  const hasCte = isHttp(invoice.xml_cte_url);
  const hasComprovante = isHttp(invoice.comprovante_url);

  const issue = invoice.issue_date
    ? new Date(invoice.issue_date).toLocaleDateString("pt-BR")
    : "—";

  const statusLabel =
    invoice.delivery_status === "finalizada"
      ? "Finalizada"
      : invoice.delivery_status === "aguardando_comprovante"
        ? "Aguardando comprovante"
        : "Em aberto";

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
          alignItems: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            width: isMobile ? "100%" : 560,
            maxHeight: "85%",
            backgroundColor: theme.card,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Header */}
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
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>
              NF-e {invoice.nfe}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Feather name="x" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Row label="Série" value={invoice.serie_nf} theme={theme} />
            <Row label="CT-e" value={invoice.cte} theme={theme} />
            <Row
              label="Valor NF-e"
              value={formatCurrency(invoice.value_nfe)}
              theme={theme}
            />
            <Row
              label="Valor CT-e"
              value={formatCurrencyCTe(invoice.cte_value)}
              theme={theme}
            />
            <Row label="Emissão" value={issue} theme={theme} />
            <Row
              label="Natureza"
              value={invoice.nature_transaction}
              theme={theme}
            />
            <Row label="Peso bruto" value={invoice.weight_brute} theme={theme} />
            <Row label="Volumes" value={invoice.quantity_volumes} theme={theme} />
            <Row label="Chave / Código" value={invoice.barcode} theme={theme} />
            <Row
              label="Remetente"
              value={invoice.remetente?.name_client}
              theme={theme}
            />
            <Row
              label="Destinatário"
              value={invoice.destinatario?.name_client}
              theme={theme}
            />
            <Row label="Entrega" value={statusLabel} theme={theme} />
            {!!invoice.observation && (
              <Row
                label="Observação"
                value={invoice.observation}
                theme={theme}
              />
            )}

            {/* Arquivos */}
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                marginTop: 18,
                marginBottom: 8,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              ARQUIVOS
            </Text>

            {hasNfe ? (
              <DownloadBtn
                label="Baixar NF-e (XML)"
                icon="download"
                onPress={() => openUrl(invoice.xml_nfe_url)}
                theme={theme}
              />
            ) : (
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                  fontStyle: "italic",
                  marginBottom: 8,
                }}
              >
                XML da NF-e não disponível.
              </Text>
            )}

            {hasCte && (
              <DownloadBtn
                label="Baixar CT-e (XML)"
                icon="download"
                onPress={() => openUrl(invoice.xml_cte_url)}
                theme={theme}
              />
            )}

            {hasComprovante && (
              <DownloadBtn
                label="Ver comprovante de entrega"
                icon="eye"
                onPress={() => openUrl(invoice.comprovante_url)}
                theme={theme}
              />
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 14,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: theme.borderColor,
            }}
          >
            <Text
              style={{
                color: theme.isDark ? theme.link : theme.primary,
                fontWeight: "700",
              }}
            >
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
