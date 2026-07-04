import { StyleSheet, Platform } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

// Estilos da tela de Status. Tudo semântico via theme; hex hardcoded foi
// removido do JSX e movido pra cá (badges e toggles ganharam nomes).
export const createStatusStyles = (
  theme: typeof lightTheme | typeof darkTheme,
  isMobile: boolean,
) =>
  StyleSheet.create({
    // ── Layout raiz ──
    container: {
      flex: 1,
    },

    // Botão "voltar" fixo no header das telas de create/edit
    backButton: {
      left: 16,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 10,
    },

    // Wrapper de conteúdo (padding top varia por plataforma)
    content: {
      paddingTop: Platform.OS === "ios" ? 10 : isMobile ? 70 : 10,
      paddingHorizontal: 10,
      paddingBottom: 10,
    },

    // Header da tela (título + botão "novo")
    headers: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      marginBottom: 20,
    },

    title: {
      width: "100%",
      textAlign: "center",
      color: theme.text,
      fontSize: 24,
      fontWeight: "bold",
    },

    // Botão "+" de adicionar novo status
    btn_add: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },

    search: {
      width: "100%",
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 12,
      color: theme.text,
      fontSize: 16,
    },

    no_data: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      color: theme.error,
      fontSize: 16,
    },

    list: {
      flex: 1,
      padding: 10,
      marginBottom: 10,
    },

    listItem: {
      flex: 1,
      gap: 10,
      padding: 10,
      borderColor: theme.borderColor,
      borderWidth: 1,
      borderRadius: 12,
      boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
      marginBottom: 10,
      flexDirection: isMobile ? "column" : "row",
    },

    listItemContent: {
      flex: 1,
      gap: 10,
      justifyContent: "space-between",
    },

    listItemTitleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
    },

    listItemTitle: {
      textTransform: "uppercase",
      color: theme.isDark ? theme.link : theme.primary,
      fontSize: 16,
      fontWeight: "bold",
    },

    listItemDescription: {
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      color: theme.isDark ? theme.textSecondary : theme.text,
      fontSize: 14,
      paddingBottom: 10,
      paddingTop: 10,
    },

    listItemActions: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
      marginLeft: 20,
    },

    icon: {
      width: isMobile ? "50%" : 100,
      padding: 6,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },

    editBtn: {
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
    },

    editText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 13,
    },

    toggleDeactivate: {
      backgroundColor: theme.isDark ? "#78350f" : "#f59e0b",
    },

    toggleActivate: {
      backgroundColor: theme.isDark ? "#166534" : "#22c55e",
    },

    toggleText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 13,
    },

    inactiveBadge: {
      color: theme.error,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
    },

    deleteBtn: {
      backgroundColor: theme.isDark ? "#4c1d1d" : "#fee2e2",
    },

    deleteText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },

    baixarBtn: { backgroundColor: theme.isDark ? "#14532d" : "#dcfce7" },

    baixarText: {
      color: theme.isDark ? "#4ade80" : "#15803d",
      fontWeight: "600",
      fontSize: 13,
    },
  });
