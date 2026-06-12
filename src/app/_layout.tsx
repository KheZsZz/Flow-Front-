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

import { UserTypeEnum } from "@/schemas/enumSchema";
import { HOME_BY_ROLE, ROLE_ALLOWED_ROUTES } from "@/hooks/usePermission";

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
  const pathname = usePathname(); // adicione este import: import { usePathname } from "expo-router"

  useEffect(() => {
    if (loading) return;

    const inAppGroup = segments[0] === "(app)";
    const inAuthGroup = segments[0] === "(auth)";

    // Não autenticado tentando acessar app → login
    if (!user && inAppGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // Autenticado em tela de auth ou raiz → redireciona para home do perfil
    if (user && (inAuthGroup || !segments[0] || segments[0] === "index")) {
      const profile = (user.user.profile_user ?? "Commum") as UserTypeEnum;
      router.replace(HOME_BY_ROLE[profile] as any);
      return;
    }

    if (user && inAppGroup) {
      const profile = (user.user.profile_user ?? "Commum") as UserTypeEnum;
      const isAdminOrManager = profile === "Admin" || profile === "Manager";

      if (isAdminOrManager) return;

      const currentPath = "/" + segments.slice(1).join("/");

      const allowed = ROLE_ALLOWED_ROUTES[profile] ?? [];
      const hasAccess = allowed.some(
        (r) => currentPath === r || currentPath.startsWith(r + "/"),
      );

      if (!hasAccess) {
        router.replace(HOME_BY_ROLE[profile] as any);
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
        <ActivityIndicator
          size="large"
          color={theme.isDark ? theme.link : theme.primary}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Slot />
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
