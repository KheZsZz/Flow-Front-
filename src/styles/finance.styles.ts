import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

// Estilos da tela /finance: topo fixo com abas (Operacional/Administrativo)
// + lista rolável, seguindo o esqueleto visual do settings.styles.ts
export const createFinanceStyles = (
  theme: typeof lightTheme | typeof darkTheme,
  isMobile: boolean,
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

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
    subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },

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
    tabActive: { backgroundColor: theme.primary },
    tabLabel: { fontSize: 13, fontWeight: "600", color: theme.textSecondary },
    tabLabelActive: { color: "#fff" },

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
    cardAmount: { fontSize: 15, fontWeight: "700", color: theme.primary },
    cardMeta: { fontSize: 12, color: theme.textSecondary },

    fab: {
      position: "absolute",
      right: isMobile ? 16 : 32,
      bottom: isMobile ? 16 : 32,
      backgroundColor: theme.primary,
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyState: { padding: 32, alignItems: "center" },
    emptyText: { color: theme.textSecondary, fontSize: 13 },
  });
