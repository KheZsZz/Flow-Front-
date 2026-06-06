import { StyleSheet } from "react-native";
import { darkTheme, lightTheme } from "@/constants/colors";

export const createInputStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) => {
  return StyleSheet.create({
    container: {
      width: "100%",
      marginBottom: 16,
      backgroundColor: "transparent",
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      backgroundColor: "transparent",
      color: theme.text,
    },

    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      height: 50,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: theme.isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.8)",
      borderColor: theme.isDark
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(0, 0, 0, 0.12)",
    },

    input: {
      fontSize: 15,
      color: theme.text,
      flex: 1,
      height: "100%",
      paddingHorizontal: 8,
      borderWidth: 0,
    },

    errorText: {
      fontSize: 12,
      marginTop: 4,
    },
  });
};
