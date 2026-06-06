import { StyleSheet } from "react-native";
import { darkTheme, lightTheme } from "@/constants/colors";

export const createDashboardStyles = (
  theme: typeof lightTheme | typeof darkTheme,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    scrollContainer: {
      padding: 20,
    },
    header: {
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 2,
      color: theme.text
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    card: {
      width: "48%",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 6,
    },
    cardValue: {
      fontSize: 20,
      fontWeight: "700",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
    },
    recentList: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 8,
    },
    orderItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
    },
    orderInfo: {
      flex: 1,
    },
    orderMain: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    orderSub: {
      fontSize: 12,
    },
    statusBadge: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "700",
    },
  });
