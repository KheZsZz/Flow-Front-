import { Platform, StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";
import { is } from "zod/v4/locales";

type AppTheme = typeof lightTheme | typeof darkTheme;

// ─── Status config exportado para uso no componente ───────────────────────────
export type UploadStatus = "success" | "duplicate" | "error";

export const STATUS_CONFIG: Record<
  UploadStatus,
  { color: string; icon: string; label: string }
> = {
  success: { color: "#84cc16", icon: "check-circle", label: "Importada" },
  duplicate: { color: "#f97316", icon: "alert-circle", label: "Já cadastrada" },
  error: { color: "#ef4444", icon: "x-circle", label: "Erro" },
};

// ─── Upload screen ─────────────────────────────────────────────────────────────
export const createInvoiceUploadStyles = (theme: AppTheme, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
      alignItems: "center",
      width: "100%",
    },

    header: {
      padding: 10,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      gap: 15,
    },

    backButton: {
      position: "absolute",
      top: 10,
      left: 10,
      margin: 10,
      borderRadius: 10,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
    },

    title: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "bold",
    },

    // ── Métricas ──────────────────────────────────────────────────────────────
    metricsRow: {
      width: isMobile ? "90%" : "60%",
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
    },

    metricCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 12,
      alignItems: "center",
    },

    metricNumber: {
      fontSize: 24,
      fontWeight: "bold",
    },

    metricLabel: {
      fontSize: 11,
      marginTop: 2,
    },

    // ── Drop zone ─────────────────────────────────────────────────────────────
    dropzone: {
      justifyContent: "center",
      alignItems: "center",
      width: isMobile ? "90%" : "60%",
      borderColor: theme.isDark ? theme.textSecondary : theme.primary,
      borderWidth: 2,
      borderStyle: "dashed",
      borderRadius: 15,
      padding: 32,
      margin: 16,
      gap: 10,
    },

    dropzoneText: {
      color: theme.text,
      fontSize: 13,
      textAlign: "center",
    },

    // ── Lista de arquivos / resultados ────────────────────────────────────────
    fileList: {
      flex: 1,
      padding: 20,
      width: "100%",
      marginBottom: 12,
    },

    ListContent: {
      flex: 1,
      width: isMobile ? "100%" : "60%",
    },

    fileRow: {
      backgroundColor: theme.isDark
        ? "rgba(255,255,255,0.16)"
        : "rgba(0,0,0,0.05)",
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 10,
      marginBottom: 8,
      gap: 12,
    },

    fileName: {
      flex: 1,
      marginLeft: 10,
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
    },

    fileMessage: {
      fontSize: 12,
      marginTop: 2,
    },

    removeButton: {
      backgroundColor: theme.error,
      borderRadius: 8,
      padding: 6,
    },

    button: {
      backgroundColor: theme.primary,
      padding: 18,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      width: isMobile ? "90%" : "60%",
      margin: 12,
    },

    buttonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export const createInvoiceListStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
    },
    content: {
      paddingTop: Platform.OS === "ios" ? 10 : 70,
      paddingHorizontal: 10,
      paddingBottom: 10,
    },

    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: "bold",
    },

    headers: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },

    btn_add: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 12,
    },

    search: {
      width: "60%",
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 12,
      color: theme.text,
      fontSize: 16,
    },

    card: {
      backgroundColor: theme.card,
      marginHorizontal: 15,
      marginVertical: 8,
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },

    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    invoiceNumber: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 15,
    },

    invoiceValue: {
      color: theme.primary,
      fontWeight: "bold",
      fontSize: 15,
    },

    issuerText: {
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 6,
    },

    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },

    dateText: {
      color: theme.textSecondary,
      fontSize: 12,
    },

    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },

    badgeText: {
      fontSize: 11,
      fontWeight: "700",
    },
  });
