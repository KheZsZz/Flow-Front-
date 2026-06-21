import React from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { createInvoiceListStyles } from "@/styles/invoices.styles";
import { useTheme } from "@/contexts/themeContext";

export function InvoiceActions({
  onEdit,
  onDelete,
  onViewComprovante,
  hasComprovante,
}: any) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 820;
  const styles = createInvoiceListStyles(theme, isMobile);

  return (
    <View style={styles.actionsContainer}>
      {/* Visualizar comprovante — só quando o canhoto já foi enviado */}
      {hasComprovante && (
        <TouchableOpacity
          onPress={onViewComprovante}
          style={[styles.btnAction, styles.baixarBtn]}
        >
          <Feather
            name="eye"
            size={18}
            color={theme.isDark ? "#4ade80" : "#15803d"}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onEdit}
        style={[styles.editBtn, styles.btnAction]}
      >
        <Feather
          name="edit-2"
          size={18}
          color={theme.isDark ? "#60a5fa" : "#1a73e8"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        style={[styles.deleteBtn, styles.btnAction]}
      >
        <Feather name="trash-2" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}
