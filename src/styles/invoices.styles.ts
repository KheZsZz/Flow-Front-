import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createInvoiceUploadStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      justifyContent: "center",
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    title: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "bold",
      marginTop: 20,
    },
    subtitle: {
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 10,
      lineHeight: 20,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 18,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    buttonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
    iconRightSpace: {
      marginRight: 10,
    },
  });

export const createInvoiceListStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.card,
      marginHorizontal: 15,
      marginVertical: 8,
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    invoiceNumber: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    invoiceValue: {
      color: theme.primary,
      fontWeight: "bold",
      fontSize: 15,
    },
    issuerText: {
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 6,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    dateText: {
      color: theme.textSecondary,
      fontSize: 12,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "700",
    },
  });
