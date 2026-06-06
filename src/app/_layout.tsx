// src/app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "@/contexts/authContext";
import { ThemeProvider, useTheme, ThemeMode } from "@/contexts/themeContext";

function GlobalThemeToggle() {
  const { mode, isDark, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();

  const options: {
    id: ThemeMode;
    icon: "sun" | "smartphone" | "moon";
    label: string;
  }[] = [
    { id: "light", icon: "sun", label: "Claro" },
    { id: "dark", icon: "moon", label: "Escuro" },
  ];

  return (
    <View
      style={[
        styles.toggleContainer,
        {
          top: insets.top > 0 ? insets.top + 10 : 20,
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(255, 255, 255, 0.75)",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(0, 0, 0, 0.08)",
        },
      ]}
    >
      {options.map((opt) => {
        const isActive = mode === opt.id;
        const activeColor = isDark ? "#ffffff" : "#000000";
        const inactiveColor = isDark
          ? "rgba(255, 255, 255, 0.4)"
          : "rgba(0, 0, 0, 0.4)";

        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.7}
            onPress={() => setThemeMode(opt.id)}
            style={[
              styles.segmentButton,
              isActive && {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.06)",
              },
            ]}
          >
            <Feather
              name={opt.icon}
              size={15}
              color={isActive ? activeColor : inactiveColor}
            />
            {isActive && (
              <Text style={[styles.segmentLabel, { color: activeColor }]}>
                {opt.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function NavigationGuard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAppGroup = segments[0] === "(app)";

    if (!user && inAppGroup) {
      router.replace("/(auth)/login");
    } else if (user) {
      const inAuthGroup = segments[0] === "(auth)";
      if (inAuthGroup || !segments[0] || segments[0] === "index") {
        switch (user.profile_user) {
          case "Driver":
            router.replace("/(app)/driver");
            break;
          case "Requestor":
          case "Commum":
            router.replace("/(app)/orders/create");
            break;
          case "Financer":
            router.replace("/(app)/finance");
            break;
          case "Admin":
          case "Manager":
          default:
            router.replace("/(app)/dashboard");
            break;
        }
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background || "#ffffff" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary || "#0070f3"} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Slot />
      {/*<GlobalThemeToggle />*/}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationGuard />
          <Toast />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleContainer: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    zIndex: 99999,
  },
  segmentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
