import { ThemeType } from "@/contexts/themeContext";

export const createFuelStyles = (theme: ThemeType, isMobile: boolean) => ({
  container: { flex: 1, backgroundColor: theme.background },

  // Cabeçalho fixo (sem abas — Abastecimento não tem sub-seções)
  header: { padding: isMobile ? 16 : 32, paddingBottom: 12 },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: "700" as const,
    color: theme.text,
  },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },

  // Lista de abastecimentos
  listContent: {
    paddingHorizontal: isMobile ? 16 : 32,
    paddingBottom: 100,
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
    color: theme.primary,
  },
  cardMeta: { fontSize: 12, color: theme.textSecondary },

  // Botão flutuante de novo lançamento
  fab: {
    position: "absolute" as const,
    right: isMobile ? 16 : 32,
    bottom: isMobile ? 16 : 32,
    backgroundColor: theme.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  emptyState: { padding: 32, alignItems: "center" as const },
  emptyText: { color: theme.textSecondary, fontSize: 13 },
});
