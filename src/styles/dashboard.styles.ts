import { darkTheme, lightTheme } from "@/constants/colors";
import { StyleSheet } from "react-native";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createDashboardStyles = (theme: AppTheme, isMobile: boolean) =>
  StyleSheet.create({
    /* ── Layout base ──────────────────────────────────────── */
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scroll: {
      padding: isMobile ? 16 : 24,
      paddingBottom: 48,
      gap: 18,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    headerTexts: {
      flex: 1,
    },
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "bold",
    },
    subtitle: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 13,
      marginTop: 2,
    },
    roleTag: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    roleTagText: {
      fontSize: 12,
      fontWeight: "700",
    },

    /* ── Barra de filtros ─────────────────────────────────── */
    filterBar: {
      backgroundColor: theme.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderColor,
      padding: 14,
      gap: 10,
    },
    filterTitle: {
      color: theme.isDark ? theme.link : theme.primary,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    filterRow: {
      flexDirection: isMobile ? "column" : "row",
      gap: 12,
    },
    filterCol: {
      flex: 1,
    },
    clearBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
    },
    clearBtnText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 13,
    },

    /* ── Grade de KPIs ────────────────────────────────────── */
    kpiGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    kpiCard: {
      flexGrow: 1,
      flexBasis: isMobile ? "47%" : 180,
      minWidth: isMobile ? "47%" : 180,
      backgroundColor: theme.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderColor,
      padding: 14,
      gap: 8,
    },
    kpiTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    kpiIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    kpiValue: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "bold",
    },
    kpiLabel: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
    },
    kpiSub: {
      color: theme.isDark ? "#888" : "#888",
      fontSize: 11,
    },

    /* ── Seções / cards ───────────────────────────────────── */
    section: {
      backgroundColor: theme.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderColor,
      padding: 16,
      gap: 14,
    },
    sectionHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    sectionHint: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
    },

    /* ── Barras (visual em View) ──────────────────────────── */
    barRow: {
      gap: 6,
    },
    barTopLine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    barLabel: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "500",
      flex: 1,
    },
    barValue: {
      color: theme.isDark ? "#ccc" : "#444",
      fontSize: 13,
      fontWeight: "700",
    },
    barTrack: {
      height: 10,
      borderRadius: 6,
      backgroundColor: theme.isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.06)",
      overflow: "hidden",
    },
    barFill: {
      height: 10,
      borderRadius: 6,
    },

    /* ── Chips de filtro de veículo ───────────────────────── */
    chipScroll: {
      gap: 8,
      paddingVertical: 2,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    chipText: {
      fontSize: 12,
      fontWeight: "600",
    },

    /* ── Lista de atividade recente ───────────────────────── */
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    listIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
    },
    listMain: {
      flex: 1,
    },
    listTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
    },
    listSub: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
      marginTop: 1,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 14,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: "700",
    },

    /* ── Estados vazio / carregando ───────────────────────── */
    center: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    emptyText: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 14,
      textAlign: "center",
    },
  });
