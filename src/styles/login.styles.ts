import { Dimensions, StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

export const createLoginStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },

    gradient: {
      ...StyleSheet.absoluteFill,
    },

    blur: {
      ...StyleSheet.absoluteFill,
    },

    content: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: Dimensions.get("window").width - 70,
      padding: 20,
    },

    headers: {
      flex: 1,
      height: "100%",
      width: "30%",
      padding: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.primary,
      elevation: 5,
      borderTopStartRadius: 14,
      borderBottomStartRadius: 14,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },

    card: {
      width: "50%",
      height: "100%",
      padding: 20,
      borderTopEndRadius: 14,
      borderBottomEndRadius: 14,
      alignItems: "center",
      overflow: "hidden",
      borderWidth: 1,
      boxShadow: "10px 10px 10px rgba(0, 0, 0, 0.15)",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 5,
      borderColor: theme.isDark
        ? "rgba(255,255,255,0.1)"
        : "rgba(255,255,255,0.3)",
      backgroundColor: theme.isDark
        ? "rgba(0,0,0,0.25)"
        : "rgba(255,255,255,0.3)",
    },
    image: {
      width: "30%",
      height: "32%",
      marginBottom: 50,
      borderRadius: "50%",
    },

    title: {
      fontSize: 42,
      fontWeight: "bold",
      color: theme.textSecondary,
      marginBottom: 22,
    },

    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
    },

    form: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      marginTop: 50,
    },
  });
