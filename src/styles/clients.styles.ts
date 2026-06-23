import { darkTheme, lightTheme } from "@/constants/colors";
import { StyleSheet, Platform } from "react-native";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createClientsStyles = (theme: AppTheme, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      paddingTop: Platform.OS === "ios" ? 10 : isMobile ? 70 : 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "bold",
    },

    addBtn: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      paddingHorizontal: 12,
      marginBottom: 20,
      height: 48,
    },

    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      paddingHorizontal: 8,
    },

    emptyText: {
      color: theme.textSecondary,
      fontSize: 16,
      textAlign: "center",
      marginTop: 40,
      opacity: 0.6,
    },

    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: isMobile ? "center" : "flex-start",
    },
    card: {
      width: "100%",
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: "hidden",
    },
    cardHeader: {
      padding: 14,
      borderBottomWidth: 3,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      // borderBottomColor: client.is_active ? "#3b82f6" : "#ef4444",
    },
    cardHeaderText: {
      flex: 1,
    },
    clientName: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    clientDoc: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
      marginTop: 2,
    },
    cardBody: {
      padding: 14,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    infoText: {
      color: theme.isDark ? "#ccc" : "#444",
      fontSize: 13,
      flex: 1,
    },
    addressText: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
      marginTop: 4,
    },
    cardFooter: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      padding: 10,
      gap: 8,
      justifyContent: "flex-end",
      width: "100%",
    },
    editBtn: {
      flex: isMobile ? 1 : undefined,
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    editBtnText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 13,
    },
    toggleBtn: {
      flex: isMobile ? 1 : undefined,
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    toggleBtnText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 13,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "bold",
    },
  });

export const updateClientStyles = (theme: AppTheme, isMobile: boolean) =>
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
      marginBottom: 20,
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "bold",
    },
    addBtn: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      paddingHorizontal: 12,
      marginBottom: 20,
      height: 48,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      paddingHorizontal: 8,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 16,
      textAlign: "center",
      marginTop: 40,
      opacity: 0.6,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: isMobile ? "center" : "flex-start",
    },
    card: {
      width: isMobile ? "100%" : 340,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: "hidden",
    },
    cardHeader: {
      padding: 14,
      borderBottomWidth: 3,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cardHeaderText: {
      flex: 1,
    },
    clientName: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    clientDoc: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
      marginTop: 2,
    },
    cardBody: {
      padding: 14,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    infoText: {
      color: theme.isDark ? "#ccc" : "#444",
      fontSize: 13,
      flex: 1,
    },
    addressText: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
      marginTop: 4,
    },
    cardFooter: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      padding: 10,
      gap: 8,
    },
    editBtn: {
      flex: 1,
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    editBtnText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 13,
    },
    toggleBtn: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    toggleBtnText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 13,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "bold",
    },
  });

export const listClientStyles = (theme: any, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },

    title: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "bold",
    },
    backButton: {
      position: "absolute",
      left: 16,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 10,
    },

    scrollContent: {
      paddingBottom: 40,
    },
    form: {
      paddingHorizontal: isMobile ? 20 : 40,
      paddingTop: 24,
      width: isMobile ? "100%" : "60%",
      alignSelf: "center",
    },
    sectionTitle: {
      color: theme.isDark ? theme.link : theme.primary,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 14,
      marginTop: 10,
    },
    divider: {
      height: 1,
      backgroundColor: theme.borderColor,
      marginVertical: 20,
    },
    row: {
      flexDirection: isMobile ? "column" : "row",
      gap: 12,
    },
    rowItem: {
      flex: 1,
    },
    button: {
      marginHorizontal: isMobile ? 20 : "20%",
      marginTop: 28,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 18,
      borderRadius: 12,
      alignItems: "center",
    },
    buttonText: {
      color: theme.isDark ? theme.primary : "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
  });
