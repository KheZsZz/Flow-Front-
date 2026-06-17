import { StyleSheet } from "react-native";
import { darkTheme, lightTheme } from "@/constants/colors";
type AppTheme = typeof lightTheme | typeof darkTheme;

export const createVehicleListStyles = (theme: AppTheme, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },

    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "bold",
    },

    emptyText: {
      color: theme.text,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
    },

    addBtn: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },

    // Grid container
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 20,
      justifyContent: isMobile ? "center" : "flex-start",
    },

    // Card
    card: {
      width: isMobile ? "100%" : 320,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: "hidden",
    },

    search: {
      width: isMobile ? "60%" : "100%",
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 12,
      color: theme.text,
      fontSize: 16,
    },

    imagePlaceholder: {
      height: 120,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      borderBottomWidth: 4,
    },

    titleBar: {
      padding: 10,
      alignItems: "center",
    },

    titleText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },

    body: {
      padding: 15,
    },

    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      boxShadow: isMobile ? undefined : "2px 2px 4px rgba(0, 0, 0, 0.1)",
    },

    label: {
      color: "#AAA",
      fontSize: 12,
    },

    toggleBtn: {
      margin: 5,
      alignItems: "center",
      // backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 8,
      borderRadius: 4,
      width: isMobile ? "30%" : 70,
    },

    deleteBtn: { backgroundColor: theme.isDark ? "#4c1d1d" : "#fee2e2" },
    deleteText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },

    baixarBtn: { backgroundColor: theme.isDark ? "#14532d" : "#dcfce7" },
    baixarText: {
      color: theme.isDark ? "#4ade80" : "#15803d",
      fontWeight: "600",
      fontSize: 13,
    },

    editBtn: {
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
    },

    editText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 13,
    },

    footer: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#333",
      paddingTop: 10,
    },
    footerText: { color: "#666", fontSize: 11 },
  });
