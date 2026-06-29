import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createSettingsStyles = (theme: AppTheme, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: 20,
    },

    topbar: {
      flexShrink: 0,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
      zIndex: 2,
    },

    tabBarScroll: {
      height: 64,
      flexGrow: 0,
    },

    scrollArea: {
      flex: 1,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: isMobile ? 30 : 16,
      paddingBottom: 8,
    },

    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "bold",
    },
    subtitle: {
      color: theme.text,
      fontSize: 13,
      marginTop: 2,
      opacity: 0.7,
    },

    /* ── Abas ─────────────────────────────────────────── */
    tabBar: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      position: "absolute",
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.card,
      height: 40,
    },
    tabActive: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      borderColor: theme.isDark ? theme.link : theme.primary,
    },
    tabText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
    },
    tabTextActive: {
      color: theme.isDark ? theme.primary : "#fff",
    },

    /* ── Conteúdo ─────────────────────────────────────── */
    content: {
      overflow: "hidden",
      paddingHorizontal: 20,
      paddingBottom: 40,
      width: isMobile ? "100%" : "70%",
      alignSelf: isMobile ? "stretch" : "center",
    },
    sectionTitle: {
      color: theme.isDark ? theme.link : theme.primary,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 18,
    },
    sectionHint: {
      color: theme.isDark ? theme.textSecondary : theme.text,
      fontSize: 12,
      opacity: 0.7,
      marginBottom: 14,
    },
    divider: {
      height: 1,
      backgroundColor: theme.borderColor,
      marginVertical: 20,
    },

    /* ── Card genérico ────────────────────────────────── */
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      padding: 14,
      marginBottom: 12,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    cardTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
    },
    cardSub: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 2,
      opacity: 0.8,
    },

    /* ── Avatar ───────────────────────────────────────── */
    avatarWrap: {
      alignItems: "center",
      marginVertical: 10,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },

    /* ── Botões ───────────────────────────────────────── */
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 14,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
    },
    secondaryBtn: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginTop: 8,
    },
    secondaryBtnText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 14,
    },
    dangerBtn: {
      backgroundColor: theme.isDark ? "#4c1d1d" : "#fee2e2",
      padding: 8,
      borderRadius: 8,
    },
    dangerText: {
      color: "#ef4444",
      fontWeight: "600",
      fontSize: 13,
    },

    /* ── Chips (janela de alerta / filtros) ───────────── */
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.card,
    },
    chipActive: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      borderColor: theme.isDark ? theme.link : theme.primary,
    },
    chipText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
    },
    chipTextActive: {
      color: theme.isDark ? theme.primary : "#fff",
    },

    /* ── Badge de severidade / status ─────────────────── */
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "bold",
    },

    /* ── Estados ──────────────────────────────────────── */
    emptyText: {
      color: theme.textSecondary,
      fontSize: 15,
      textAlign: "center",
      marginTop: 40,
      opacity: 0.6,
    },
    centered: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },

    /* ── Linhas de auditoria ──────────────────────────── */
    auditMeta: {
      color: theme.textSecondary,
      fontSize: 11,
      opacity: 0.7,
      marginTop: 4,
    },
  });
