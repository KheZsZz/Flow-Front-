import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

export const createButtonStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) =>
  StyleSheet.create({
    button: {
      width: "100%",
      padding: 16,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      backgroundColor: theme.primary,
      borderColor: theme.borderColor,
      borderWidth: 0.5,
    },

    buttonText: {
      zIndex: 1,
      color: theme.textSecondary,
      fontSize: 15,
      fontWeight: "600",
    },
  });
