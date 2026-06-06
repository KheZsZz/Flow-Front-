import { Dimensions, StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

export const createLoginStyles = (
  theme: typeof lightTheme | typeof darkTheme,
  isMobile: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    gradient: { ...StyleSheet.absoluteFill },
    blur: { ...StyleSheet.absoluteFill },

    content: {
      flexDirection: isMobile ? "column" : "row",
      width: isMobile ? "100%" : "80%",
      alignItems: "stretch",
      justifyContent: "center",
      height: isMobile ? "auto" : "80%",
    },

    headers: {
      width: isMobile ? "100%" : "30%", // 30% em desktop
      padding: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.primary,
      borderTopLeftRadius: 14,
      borderBottomLeftRadius: isMobile ? 0 : 14,
      borderTopRightRadius: isMobile ? 14 : 0,
    },

    card: {
      width: isMobile ? "100%" : "50%", // 50% em desktop
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark
        ? "rgba(0,0,0,0.25)"
        : "rgba(255,255,255,0.3)",
      borderTopRightRadius: 14,
      borderBottomRightRadius: 14,
      borderBottomLeftRadius: isMobile ? 14 : 0,
    },

    image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 20,
    },

    title: {
      fontSize: isMobile ? 24 : 32,
      fontWeight: "bold",
      color: theme.textSecondary,
      textAlign: "center",
    },

    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
    },

    form: {
      width: "100%",
      marginBottom: 20,
    },
  });
