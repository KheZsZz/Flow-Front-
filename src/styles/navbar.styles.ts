import { StyleSheet, Platform } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createNavbarStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // ── Sidebar container ────────────────────────────────────────────────────
    sidebar: {
      width: 240,
      paddingHorizontal: 12,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: theme.isDark ? "#0d1526" : "#1a3a6b",
      borderRightWidth: 1,
      borderRightColor: "rgba(255,255,255,0.07)",
      ...Platform.select({
        web: {
          transitionProperty: "width",
          transitionDuration: "0.2s",
        } as any,
      }),
    },
    sidebarCollapsed: {
      width: 72,
      alignItems: "center",
    },
    mobileSidebar: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 12,
      backgroundColor: theme.isDark ? "#0d1526" : "#1a3a6b",
    },

    // ── Header ───────────────────────────────────────────────────────────────
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
      minHeight: 40,
    },
    headerContainerCollapsed: {
      justifyContent: "center",
    },
    logoText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 0.5,
      flex: 1,
    },
    toggleButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },

    // ── Theme toggle ─────────────────────────────────────────────────────────
    themeTrack: {
      flexDirection: "row",
      borderRadius: 8,
      padding: 3,
      marginBottom: 20,
    },
    themeOptionCollapsed: {
      height: 36,
      width: "100%",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    themeOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 6,
      borderRadius: 6,
    },
    themeOptionText: {
      fontSize: 12,
    },

    // ── User badge ───────────────────────────────────────────────────────────
    userBadge: {
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 8,
      marginBottom: 4,
    },
    userAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginBottom: 10,
    },
    avatarFallback: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      backgroundColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    avatarInitials: {
      fontSize: 22,
      fontWeight: "700",
    },
    avatarCollapsed: {
      alignItems: "center",
      marginBottom: 8,
    },
    avatarFallbackSm: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    userName: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      textAlign: "center",
    },
    roleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
    },
    roleText: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // ── Divider ──────────────────────────────────────────────────────────────
    divider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.08)",
      marginVertical: 12,
      marginHorizontal: 4,
    },

    // ── Menu ─────────────────────────────────────────────────────────────────
    menuContainer: {
      flex: 1,
      gap: 2,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 10,
      position: "relative",
    },
    menuItemCollapsed: {
      justifyContent: "center",
      paddingHorizontal: 0,
      width: 48,
      alignSelf: "center",
    },
    menuItemActive: {
      backgroundColor: "rgba(255,255,255,0.12)",
    },
    menuItemPressed: {
      backgroundColor: "rgba(255,255,255,0.07)",
    },
    menuItemText: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
    },
    menuItemTextActive: {
      color: "#fff",
      fontWeight: "600",
    },
    activeIndicator: {
      position: "absolute",
      left: 0,
      top: 8,
      bottom: 8,
      width: 3,
      borderRadius: 2,
      backgroundColor: "#fff",
    },

    // ── Logout ───────────────────────────────────────────────────────────────
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: "rgba(239,68,68,0.75)",
      marginTop: 8,
    },
    logoutButtonCollapsed: {
      width: 48,
      alignSelf: "center",
      gap: 0,
    },
    logoutButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },

    // ── Hamburger (mobile) ───────────────────────────────────────────────────
    hamburger: {
      position: "absolute",
      bottom: 22,
      right: 12,
      zIndex: 100,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 6,
    },
  });
