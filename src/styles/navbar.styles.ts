import { Dimensions, StyleSheet, Platform } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";
import { Color } from "expo-router";

export const createNavbarStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) =>
  StyleSheet.create({
    sidebar: {
      width: 260,
      backgroundColor: theme.primary,
      padding: 20,
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

    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
      height: 40,
    },

    headerContainerCollapsed: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },

    userAvatar: {
      justifyContent: "center",
      alignItems: "center",
      width: 70,
      height: 70,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      marginBottom: 12,
      // backgroundColor: "#FFF",
    },

    logoText: {
      color: theme.textSecondary,
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: 1,
      alignItems: "center",
    },

    toggleButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: theme.isDark ? theme.link : theme.card,
    },

    toggleButtonHover: {
      opacity: 0.85,
    },

    userBadge: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
      padding: 12,
      backgroundColor: "transparent",
      borderRadius: 8,
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
      color: theme.text,
      borderLeftWidth: 3,
      borderLeftColor: theme.text,
    },

    menuItemHover: {
      backgroundColor: theme.success,
      opacity: 0.7,
    },

    menuItemActiveHover: {
      backgroundColor: theme.card,
      opacity: 0.9,
    },

    menuItemText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: "500",
    },

    menuItemTextActive: {
      color: theme.text, // Puxa a cor principal de texto do tema ativo
      fontWeight: "600",
    },

    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: theme.error, // Vermelho de erro ideal para logout
      marginTop: "auto",
      width: "100%",
    },

    // 🚀 NOVO: Hover do botão de sair para dar feedback visual
    logoutButtonHover: {
      opacity: 0.9,
      backgroundColor: theme.error,
      shadowColor: "#000", // Leve sombra na web
      ...Platform.select({
        web: {
          filter: "brightness(0.9)", // Deixa o vermelho ligeiramente mais escuro no hover
        } as any,
      }),
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
  });
