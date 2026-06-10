import { StyleSheet, Platform } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createNavbarStyles = (theme: AppTheme) =>
  StyleSheet.create({
    sidebar: {
      width: 260,
      backgroundColor: theme.primary,
      padding: 10,
      justifyContent: "space-between",
      borderRightWidth: 1,
      borderRightColor: theme.inputBorder,
      ...Platform.select({
        web: {
          transitionProperty: "width, background-color",
          transitionDuration: "0.2s",
        } as any,
      }),
    },

    sidebarCollapsed: {
      width: 90,
      paddingHorizontal: 10,
      alignItems: "center",
    },

    // ── Header ──────────────────────────────────────────────────────────────
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      height: 40,
    },

    headerContainerCollapsed: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },

    logoText: {
      color: theme.textSecondary,
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: 1,
    },

    toggleButton: {
      marginTop: 22,
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.isDark ? theme.link : theme.card,
    },

    // ── Theme toggle ─────────────────────────────────────────────────────────
    themeTrack: {
      flexDirection: "row",
      borderRadius: 10,
      padding: 3,
      marginBottom: 20,
    },

    themeOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 7,
      borderRadius: 8,
    },

    themeOptionText: {
      fontSize: 12,
    },

    themeOptionCollapsed: {
      alignItems: "center",
      justifyContent: "center",
      height: 40,
      borderRadius: 8,
      marginBottom: 16,
    },

    // ── User badge ───────────────────────────────────────────────────────────
    userBadge: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
      padding: 12,
      borderRadius: 8,
    },

    userAvatar: {
      width: 70,
      height: 70,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },

    userName: {
      color: theme.textSecondary,
      fontSize: 22,
      fontWeight: "600",
    },

    userProfile: {
      color: theme.success,
      fontSize: 14,
      fontWeight: "bold",
      textTransform: "uppercase",
      marginTop: 2,
    },

    // ── Menu ─────────────────────────────────────────────────────────────────
    menuContainer: {
      flex: 1,
      gap: 4,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: "transparent",
    },

    menuItemCollapsed: {
      justifyContent: "center",
      paddingHorizontal: 10,
      height: 48,
    },

    menuItemActive: {
      backgroundColor: theme.card,
      borderLeftWidth: 3,
      borderLeftColor: theme.text,
    },

    menuItemText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: "500",
    },

    menuItemTextActive: {
      color: theme.text,
      fontWeight: "600",
    },

    // ── Logout ───────────────────────────────────────────────────────────────
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: theme.error,
      marginTop: "auto",
      width: "100%",
    },

    logoutButtonCollapsed: {
      gap: 0,
      paddingVertical: 12,
      borderRadius: 8,
    },

    logoutButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },

    // ── Mobile hamburguer ────────────────────────────────────────────────────
    hamburger: {
      position: "absolute",
      bottom: 22,
      right: 10,
      zIndex: 100,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 10,
    },
  });
