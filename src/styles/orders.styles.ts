import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createOrdersListStyles = (theme: AppTheme, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: isMobile ? 30 : 10,
    },

    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },

    backButton: {
      position: "absolute",
      left: 0,
      top: 0,
      padding: 10,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      borderRadius: 8,
    },

    scrollView: {
      flex: 1,
      padding: 10,
    },

    scroll: {
      backgroundColor: theme.background,
    },

    form: {
      flex: 1,
    },

    formList: {
      width: "100%",
      flexDirection: isMobile ? "column" : "row",
      gap: 16,
      justifyContent: isMobile ? "center" : "flex-start",
    },

    formListItem: {
      flex: 1,
    },

    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "bold",
    },

    sectionTitle: {
      color: theme.isDark ? theme.textSecondary : theme.text,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      marginTop: 24,
    },

    addBtn: {
      position: "absolute",
      right: 0,
      top: 0,
      padding: 10,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      borderRadius: 8,
      alignItems: "center",
    },

    filterLabel: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
    },

    dateRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
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
      width: isMobile ? "100%" : 360,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: "hidden",
    },
    cardHeader: {
      padding: 14,
      borderBottomWidth: 3,
      borderBottomColor: theme.isDark ? "#1e2640" : "#e8f0fe",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cardHeaderText: { flex: 1 },

    trackingText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 15,
    },

    driverName: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
      marginTop: 2,
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

    cardBody: {
      padding: 14,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    infoText: { color: theme.isDark ? "#ccc" : "#444", fontSize: 13, flex: 1 },
    cardFooter: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      padding: 10,
      gap: 8,
    },
    footBtn: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    baixarBtn: { backgroundColor: theme.isDark ? "#14532d" : "#dcfce7" },
    baixarText: {
      color: theme.isDark ? "#4ade80" : "#15803d",
      fontWeight: "600",
      fontSize: 13,
    },
    editBtn: { backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe" },
    editText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 13,
    },
    deleteBtn: { backgroundColor: theme.isDark ? "#4c1d1d" : "#fee2e2" },
    deleteText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },

    /* modal de baixar */
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    modalCard: {
      backgroundColor: theme.card,
      borderRadius: 14,
      maxHeight: "80%",
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: "hidden",
    },
    modalHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    modalTitle: { color: theme.text, fontSize: 16, fontWeight: "bold" },
    modalSub: {
      color: theme.textSecondary,
      fontSize: 12,
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.isDark ? theme.link : theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: theme.isDark ? theme.link : theme.primary },
    itemTitle: { color: theme.text, fontWeight: "600", fontSize: 14 },
    itemSub: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
    doneTag: { color: "#2E7D32", fontSize: 11, fontWeight: "700" },
    confirmBtn: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      margin: 16,
      borderRadius: 12,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  });

export const createOrdersItensStyles = (theme: AppTheme, isMobile: boolean) =>
  StyleSheet.create({
    segmented: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: theme.card,
      minHeight: isMobile ? "auto" : undefined,
      flexWrap: "wrap",
      gap: 16,
      padding: 5,
      borderRadius: 12,
    },

    segment: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: 50,
      minWidth: isMobile ? 150 : undefined,
      borderRadius: 12,
    },

    segmentText: {
      color: theme.text,
    },

    segmentActive: {
      backgroundColor: theme.isDark ? theme.link : theme.error,
    },

    segmentTextActive: {
      color: theme.isDark ? theme.text : theme.textSecondary,
    },

    lookupBtn: {
      backgroundColor: theme.isDark ? theme.link : theme.success,
      borderRadius: 12,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 16,
    },

    lookupBtnText: {
      marginHorizontal: 16,
      color: theme.text,
      fontWeight: "700",
      fontSize: 15,
    },

    acBox: {
      padding: 16,
      marginVertical: 12,
      gap: 12,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      boxShadow: "5px 2px 10px rgba(0, 0, 0, 0.1)",
    },

    acResult: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      justifyContent: "flex-start",
    },

    acResultText: {
      flex: 1,
      color: theme.isDark ? theme.textSecondary : theme.text,
    },

    acResultSub: {
      flex: 1,
      color: theme.isDark ? theme.textSecondary : theme.text,
      fontSize: 12,
      marginTop: 2,
    },

    acEmpty: {
      color: theme.error,
      fontSize: 12,
      marginTop: 2,
    },

    // tens adicionados
    itemCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      gap: 8,
      padding: 16,
      margin: 8,
      borderRadius: 8,
      boxShadow: "5px 2px 10px rgba(0, 0, 0, 0.1)",
    },

    itemTop: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    itemLabel: {
      color: theme.isDark ? theme.textSecondary : theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    itemSub: {
      color: theme.isDark ? theme.textSecondary : theme.text,
    },

    lockTag: {
      backgroundColor: theme.isDark ? theme.link : theme.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },

    removeBtn: {
      backgroundColor: theme.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },

    chip: {},
    chipActive: {},
  });
