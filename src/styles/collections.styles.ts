import { StyleSheet } from "react-native";

export const createCollectionStyles = (theme: any, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    title: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "bold",
    },
    backButton: {
      position: "absolute",
      left: 16,
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 10,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    form: {
      paddingHorizontal: isMobile ? 20 : 40,
      paddingTop: 24,
      width: isMobile ? "100%" : "60%",
      alignSelf: "center",
    },
    label: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      marginTop: 8,
    },
    pickerField: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.inputBorder ?? theme.borderColor,
      borderRadius: 10,
      paddingHorizontal: 14,
      height: 50,
    },
    pickerFieldText: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
    },
    pickerPlaceholder: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: 15,
    },
    errorText: {
      color: theme.error,
      fontSize: 12,
      marginTop: 4,
    },
    button: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      borderRadius: 12,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
    readonlyRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 8,
    },
    readonlyField: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.borderColor,
      padding: 12,
    },
    readonlyLabel: {
      color: theme.textSecondary,
      fontSize: 11,
      marginBottom: 4,
    },
    readonlyValue: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
    },
    lockedHint: {
      color: theme.error,
      fontSize: 13,
      marginVertical: 8,
    },
    disabledField: {
      opacity: 0.5,
    },
    toggleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      height: 48,
      marginTop: 14,
    },
    toggleBtnText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
  });

export const createCollectionsListStyles = (theme: any, isMobile: boolean) =>
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
      marginBottom: 20,
    },

    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "bold",
    },

    addBtn: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder ?? theme.borderColor,
      paddingHorizontal: 12,
      marginBottom: 20,
      height: 48,
    },

    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      paddingHorizontal: 8,
    },

    filterLabel: {
      color: theme.isDark ? theme.textSecondary : theme.text,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: theme.isDark ? "rgba(255,255,255,0.08)" : "#ECEEF1",
    },
    chipActive: {
      backgroundColor: theme.isDark ? theme.link : theme.primary,
    },
    chipText: { color: theme.text, fontSize: 13, fontWeight: "600" },
    chipTextActive: { color: "#FFF", fontSize: 13, fontWeight: "600" },
    dateRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    dateInput: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.inputBorder ?? theme.borderColor,
      paddingHorizontal: 12,
      height: 44,
      color: theme.text,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 16,
      textAlign: "center",
      marginTop: 40,
      opacity: 0.6,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: isMobile ? "center" : "flex-start",
    },
    card: {
      width: isMobile ? "100%" : 340,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: "hidden",
    },
    cardHeader: {
      padding: 14,
      borderBottomWidth: 3,
      borderBottomColor: theme.isDark ? "#1e2640" : "#e8f0fe",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cardHeaderText: {
      flex: 1,
    },
    codeText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    clientName: {
      color: theme.isDark ? "#aaa" : "#666",
      fontSize: 12,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "bold",
    },
    cardBody: {
      padding: 14,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    infoText: {
      color: theme.isDark ? "#ccc" : "#444",
      fontSize: 13,
      flex: 1,
    },
    cardFooter: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      padding: 10,
      gap: 8,
    },
    editBtn: {
      flex: 1,
      backgroundColor: theme.isDark ? "#1e2640" : "#e8f0fe",
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    editBtnText: {
      color: theme.isDark ? "#60a5fa" : "#1a73e8",
      fontWeight: "600",
      fontSize: 13,
    },
    toggleBtn: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    toggleBtnText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 13,
    },
  });
