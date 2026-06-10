import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export function InvoiceActions({ onEdit, onDelete, onView }: any) {
  return (
    <View style={styles.actionsContainer}>
      {/*<TouchableOpacity onPress={onView} style={styles.btnAction}>
        <Feather name="eye" size={18} color="#3b82f6" />
      </TouchableOpacity>*/}
      <TouchableOpacity onPress={onEdit} style={styles.btnAction}>
        <Feather name="edit-2" size={18} color="#f59e0b" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.btnAction}>
        <Feather name="trash-2" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    justifyContent: "flex-end",
  },
  btnAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});
