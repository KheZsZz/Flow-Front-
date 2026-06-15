import { StyleSheet } from "react-native";

export const createOrdersStyles = (theme: any, isMobile: boolean) => {
  const cardBg = theme.isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF";
  const border = theme.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const inputBg = theme.isDark ? "rgba(255,255,255,0.06)" : "#F2F3F5";
  const chipOff = theme.isDark ? "rgba(255,255,255,0.08)" : "#ECEEF1";

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: isMobile ? 12 : 24,
      paddingTop: 12,
    },
    content: { marginBottom: 8 },
    headers: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "700", color: theme.text },
    btn_add: {
      backgroundColor: theme.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },

    // filtros
    search: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: theme.text,
      marginBottom: 10,
    },

    dateRow: {
      width: "100%",
      flexDirection: "row",
      gap: 8,
      marginBottom: 10,
      flexWrap: "wrap",
    },

    dateInput: {
      flex: 1,
      width: "50%",
      borderRadius: 10,
      color: theme.text,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: chipOff,
    },
    chipActive: { backgroundColor: theme.primary },
    chipText: { color: theme.text, fontSize: 13, fontWeight: "600" },
    chipTextActive: { color: "#FFF", fontSize: 13, fontWeight: "600" },

    // card de viagem
    card: {
      backgroundColor: cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: border,
      padding: 14,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
    },
    badgeText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
    dateText: { color: theme.textSecondary, fontSize: 12 },
    line: { color: theme.text, fontSize: 14, marginTop: 2 },
    lineMuted: { color: theme.textSecondary, fontSize: 13, marginTop: 2 },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    metaValue: { color: theme.text, fontWeight: "700" },

    cardActions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
      justifyContent: "flex-end",
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: chipOff,
    },
    actionBtnPrimary: { backgroundColor: theme.primary },
    actionText: { color: theme.text, fontWeight: "600", fontSize: 13 },
    actionTextPrimary: { color: "#FFF", fontWeight: "700", fontSize: 13 },
    actionDisabled: { opacity: 0.4 },

    empty: { textAlign: "center", color: theme.textSecondary, marginTop: 40 },

    // ----- modal de baixa -----
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    modalCard: {
      backgroundColor: theme.isDark ? "#1B1D22" : "#FFFFFF",
      borderRadius: 16,
      padding: 18,
      maxHeight: "82%",
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: theme.text },
    modalSub: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 4,
      marginBottom: 12,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: border,
      gap: 12,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: theme.primary },
    itemTitle: { color: theme.text, fontWeight: "600" },
    itemSub: { color: theme.textSecondary, fontSize: 12 },
    doneTag: { color: "#2E7D32", fontSize: 12, fontWeight: "700" },
    modalFooter: { flexDirection: "row", gap: 10, marginTop: 16 },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    modalBtnGhost: { backgroundColor: chipOff },
    modalBtnPrimary: { backgroundColor: theme.primary },
    modalBtnText: { color: theme.text, fontWeight: "700" },
    modalBtnTextPrimary: { color: "#FFF", fontWeight: "700" },
    warn: {
      backgroundColor: theme.isDark ? "rgba(239,108,0,0.15)" : "#FFF3E0",
      borderRadius: 8,
      padding: 10,
      marginTop: 12,
    },
    warnText: { color: "#EF6C00", fontSize: 12, fontWeight: "600" },
  });
};
