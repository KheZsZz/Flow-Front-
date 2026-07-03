import { ThemeType } from "@/contexts/themeContext";

// Estilos da tela /fuel: topbar fixa com filtros (data + busca) e lista rolável.
// FAB flutuante no canto inferior direito.
export const createFuelStyles = (theme: ThemeType, isMobile: boolean) => ({
  // ── Container raiz ──
  container: {
    flex: 1,
    backgroundColor: theme.background,
    position: "relative" as const, // necessário pra ancorar o FAB
  },

  // ── Topbar (cabeçalho + filtros) ──
  topbar: {
    paddingHorizontal: isMobile ? 16 : 32,
    paddingTop: isMobile ? 16 : 24,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  header: { marginBottom: 8 },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: "700" as const,
    color: theme.text,
  },
  subtitle: { fontSize: 13, color: theme.text, marginTop: 2 },

  // ── Filtros de data lado a lado ──
  filterRow: {
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 4,
  },
  filterCell: { flex: 1 }, // divide o espaço igualmente entre De e Até

  // ── Lista de abastecimentos ──
  listContent: {
    paddingHorizontal: isMobile ? 16 : 32,
    paddingVertical: 12,
    paddingBottom: 100, // espaço pro FAB
    gap: 10,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  cardStation: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.text,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: theme.error,
  },
  cardMeta: { fontSize: 12, color: theme.text },

  // ── FAB de novo abastecimento ──
  fab: {
    position: "absolute" as const,
    right: isMobile ? 16 : 32,
    top: isMobile ? 16 : 32,
    backgroundColor: theme.isDark ? theme.link : theme.primary,
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 10, // topo do stacking iOS
    elevation: 6, // topo do stacking Android
  },

  // ── Estado vazio ──
  emptyState: { padding: 32, alignItems: "center" as const },
  emptyText: { color: theme.error, fontSize: 13 },
});
