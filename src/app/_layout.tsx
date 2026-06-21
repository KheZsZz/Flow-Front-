import React, { useEffect } from "react";
import { Slot, useRouter, useSegments, usePathname } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "@/contexts/authContext";
import { ThemeProvider, useTheme } from "@/contexts/themeContext";
import { usePermissions, HOME_BY_ROLE } from "@/hooks/usePermission";
import { UserTypeEnum } from "@/schemas/enumSchema";
import { Loadding } from "@/components/loadding";

// ─── Navigation Guard ─────────────────────────────────────────────────────────

function NavigationGuard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { canAccess } = usePermissions();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAppGroup = segments[0] === "(app)";
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && inAppGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (user && (inAuthGroup || !segments[0] || segments[0] === "index")) {
      const profile = (user.user?.profile_user ?? "Commum") as UserTypeEnum;
      router.replace(HOME_BY_ROLE[profile] as any);
      return;
    }

    // Autenticado tentando acessar rota sem permissão → home do perfil
    if (user && inAppGroup) {
      const currentPath = "/" + segments.slice(1).join("/");
      if (!canAccess(currentPath)) {
        const profile = (user.user?.profile_user ?? "Commum") as UserTypeEnum;
        router.replace(HOME_BY_ROLE[profile] as any);
      }
    }
  }, [user, loading, segments]);

  if (loading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.primary} size={50} />
    );

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
});
