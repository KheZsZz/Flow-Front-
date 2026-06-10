import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Slot } from "expo-router";
import { Sidebar } from "@/components/navbar";
import { useTheme } from "@/contexts/themeContext";

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <View style={styles.contentArea}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },

  contentArea: {
    flex: 1,
    padding: 20,
  },
});
