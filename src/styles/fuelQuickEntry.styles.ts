import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

// Estilos do card de lançamento rápido de abastecimento, embutido em /driver.
export const fuelQuickEntryStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.borderColor,
      marginTop: 16,
    },
    title: { fontSize: 16, fontWeight: "700", color: theme.text },
  });
