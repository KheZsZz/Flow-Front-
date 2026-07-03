import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

export const createFinanceStyles = (
  theme: typeof lightTheme | typeof darkTheme,
  isMobile: boolean,
) =>
  StyleSheet.create({
    // ── Container raiz ──
    container: {
      flex: 1,
      backgroundColor: theme.background,
      position: "relative",
    },

    // ── Topbar (cabeçalho + filtros + abas) ──
    topbar: {
      paddingHorizontal: isMobile ? 16 : 32,
      paddingTop: isMobile ? 16 : 24,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    header: { marginBottom: 12 },
    title: {
      fontSize: isMobile ? 20 : 24,
      fontWeight: "700",
      color: theme.text,
    },
    subtitle: { fontSize: 13, color: theme.text, marginTop: 2 },

    // ── Linha de filtros (data De/Até lado a lado) ──
    filterRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
    },
    filterCell: { flex: 1 }, // divide o espaço igualmente entre De e Até

    // ── Abas Operacional/Administrativo ──
    tabBarScroll: { flexGrow: 0 },
    tabBar: { gap: 8, paddingBottom: 12 },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: theme.card,
    },
    tabActive: { backgroundColor: theme.isDark ? theme.link : theme.primary },
    tabLabel: { fontSize: 13, fontWeight: "600", color: theme.text },
    tabLabelActive: { color: theme.textSecondary },

    // ── Lista de custos ──
    listContent: { padding: isMobile ? 16 : 32, gap: 10 },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 14,
      gap: 4,
    },
    cardTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardType: { fontSize: 14, fontWeight: "600", color: theme.text },
    cardAmount: { fontSize: 15, fontWeight: "700", color: theme.error },
    cardMeta: { fontSize: 12, color: theme.text },

    // ── FAB de novo lançamento (canto inferior direito) ──
    fab: {
      position: "absolute",
      right: isMobile ? 16 : 32,
      top: isMobile ? 16 : 32,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      width: 52,
      height: 52,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      elevation: 6,
    },

    // ── Estado vazio ──
    emptyState: { padding: 32, alignItems: "center" },
    emptyText: { color: theme.error, fontSize: 13 },
  });
