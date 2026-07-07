import { ThemeType } from "@/contexts/themeContext";

// Estilos da tela /maintenance: topbar fixa com filtros (data, categoria,
// faixa de valor, busca por placa) + lista rolável. FAB no canto inferior.
export const createMaintenanceStyles = (
  theme: ThemeType,
  isMobile: boolean,
) => ({
  // ── Container raiz ──
  container: {
    flex: 1,
    backgroundColor: theme.background,
    position: "relative" as const, // ancoragem do FAB
  },

  // ── Topbar (cabeçalho + filtros) ──
  topbar: {
    paddingHorizontal: isMobile ? 16 : 32,
    paddingTop: isMobile ? 16 : 24,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: "700" as const,
    color: theme.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.text,
    marginTop: 2,
  },

  // ── Linhas de filtros (De/Até e mín/máx lado a lado) ──
  filterRow: {
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 4,
  },
  filterCell: { flex: 1 },

  // ── Lista de manutenções ──
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
  // Código OM-000001 destacado como identificador da ordem
  cardCode: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: theme.text,
    letterSpacing: 0.5,
  },
  cardType: {
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

  // ── FAB de nova manutenção ──
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
    zIndex: 10,
    elevation: 6,
  },

  // ── Estado vazio ──
  emptyState: { padding: 32, alignItems: "center" as const },
  emptyText: { color: theme.error, fontSize: 13 },
});
