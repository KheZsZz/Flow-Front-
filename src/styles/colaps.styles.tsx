import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

export const createButtonStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) =>
  StyleSheet.create({
    sectionContainer: {
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 10,
      backgroundColor: theme.isDark
        ? darkTheme.background
        : lightTheme.background,
      borderRadius: 8,
    },

    title: {
      width: "100%",
      color: theme.isDark ? darkTheme.text : lightTheme.text,
      fontWeight: "bold",
      fontSize: 18,
      padding: 10,
    },

    content: { marginTop: 8 },
  });
