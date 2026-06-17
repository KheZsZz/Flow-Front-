import { StyleSheet, Platform } from "react-native";
import { darkTheme, lightTheme } from "@/constants/colors";

export const createInvoiceListStyles = (
  theme: typeof lightTheme | typeof darkTheme,
  isMobile: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: "60%",
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
      overflow: "visible",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
      zIndex: 10,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },

    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.isDark ? theme.textSecondary : theme.text,
    },

    message: {
      fontSize: 14,
      marginBottom: 20,
      color: theme.isDark ? theme.textSecondary : theme.text,
    },

    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
    btnCancel: { backgroundColor: "#e5e7eb" },
    btnConfirm: { backgroundColor: "#ef4444" },
  });
