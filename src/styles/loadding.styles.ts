import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

export const createLoadingStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
  });
