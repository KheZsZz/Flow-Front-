import { lightTheme, darkTheme } from "@/constants/colors";
import { StyleSheet } from "react-native";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createVehicleStyles = (theme: AppTheme, isMobile: boolean) =>
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

    form: {
      width: isMobile ? "100%" : "50%",
      paddingHorizontal: 20,
      paddingVertical: 20,
    },

    button: {
      width: isMobile ? "90%" : "50%",
      backgroundColor: theme.primary,
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
    errorText: {
      color: theme.error || "#FF5252",
      fontSize: 12,
      marginTop: 5,
    },
  });
