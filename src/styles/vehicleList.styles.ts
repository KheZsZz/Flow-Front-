import { StyleSheet } from "react-native";

export const createVehicleListStyles = (theme: any, isMobile: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    title: { color: theme.text, fontSize: 28, fontWeight: "bold" },

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
      backgroundColor: "#1a1a1a",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#333",
      overflow: "hidden",
    },
    imagePlaceholder: {
      height: 120,
      backgroundColor: "#000",
      justifyContent: "center",
      alignItems: "center",
      borderBottomWidth: 4,
    },
    titleBar: { padding: 10, alignItems: "center" },
    titleText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
    body: { padding: 15 },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    label: { color: "#AAA", fontSize: 12 },
    btnText: { color: "#FFF", fontSize: 12 },
    toggleBtn: { backgroundColor: "#2563eb", padding: 6, borderRadius: 4 },
    editBtn: { backgroundColor: "#444", padding: 6, borderRadius: 4 },
    footer: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#333",
      paddingTop: 10,
    },
    footerText: { color: "#666", fontSize: 11 },
  });
