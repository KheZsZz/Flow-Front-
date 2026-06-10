import { StyleSheet } from "react-native";

export const createVehicleListStyles = (theme: any, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },

    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "bold",
    },

    // Grid container
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 20,
      justifyContent: isMobile ? "center" : "flex-start",
    },

    // Card
    card: {
      width: isMobile ? "100%" : 320,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#333",
      overflow: "hidden",
    },

    search: {
      width: isMobile ? "60%" : "100%",
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 12,
      color: theme.text,
      fontSize: 16,
    },

    imagePlaceholder: {
      height: 120,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      borderBottomWidth: 4,
    },

    titleBar: {
      padding: 10,
      alignItems: "center",
    },

    titleText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },

    body: {
      padding: 15,
    },

    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      boxShadow: isMobile ? undefined : "2px 2px 4px rgba(0, 0, 0, 0.1)",
    },

    label: {
      color: "#AAA",
      fontSize: 12,
    },

    btnText: {
      color: "#FFF",
      fontSize: 12,
    },

    toggleBtn: {
      margin: 5,
      alignItems: "center",
      backgroundColor: "#2563eb",
      padding: 8,
      borderRadius: 4,
      width: isMobile ? "30%" : 70,
    },

    editBtn: {
      margin: 5,
      backgroundColor: "#444",
      padding: 8,
      borderRadius: 4,
      width: isMobile ? "30%" : 70,
    },
    footer: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#333",
      paddingTop: 10,
    },
    footerText: { color: "#666", fontSize: 11 },
  });
