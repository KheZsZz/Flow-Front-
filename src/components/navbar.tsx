// src/components/Sidebar.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { Feather } from "@expo/vector-icons";
import { createNavbarStyles } from "@/styles/navbar.styles";
import { useTheme } from "@/contexts/themeContext";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { theme } = useTheme();
  const styles = createNavbarStyles(theme);
  const { user, singOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "grid" as const },
    { name: "Notas Fiscais", path: "/invoices", icon: "file-text" as const },
    { name: "Frota", path: "/vehicles", icon: "truck" as const },
    { name: "Manutenção", path: "/fuel", icon: "tool" as const },
    { name: "Motoristas", path: "/drives", icon: "users" as const },
    { name: "Cargas / Rotas", path: "/orders", icon: "truck" as const },
    { name: "Configurações", path: "/settings", icon: "settings" as const },
  ];

  return (
    <View style={[styles.sidebar, isCollapsed && styles.sidebarCollapsed]}>
      <View
        style={[
          styles.headerContainer,
          isCollapsed && styles.headerContainerCollapsed,
        ]}
      >
        {!isCollapsed && (
          <Text style={styles.logoText}>
            {user?.company?.name.split(" ")[0]}
          </Text>
        )}

        <Pressable onPress={onToggle} style={styles.toggleButton}>
          <Feather
            name={isCollapsed ? "chevron-right" : "chevron-left"}
            size={20}
            color={theme.text}
          />
        </Pressable>
      </View>

      {user && !isCollapsed && (
        <View style={styles.userBadge}>
          <Image
            source={{ uri: user.user.avatar_url ?? "" }}
            style={styles.userAvatar}
          />
          <Text style={styles.userName} numberOfLines={1}>
            {user.user.name_user}
          </Text>
          <Text style={styles.userProfile}>{user.user.profile_user}</Text>
        </View>
      )}

      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Pressable
              key={item.path}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
                isCollapsed && styles.menuItemCollapsed,
              ]}
              onPress={() => router.push(item.path as any)}
            >
              <Feather
                name={item.icon}
                size={20}
                color={isActive ? theme.text : theme.textSecondary}
              />

              {!isCollapsed && (
                <Text
                  style={[
                    styles.menuItemText,
                    isActive && styles.menuItemTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.logoutButton,
          isCollapsed && styles.logoutButtonCollapsed,
        ]}
        onPress={singOut}
      >
        <Feather name="log-out" size={20} color="#ffffff" />
        {!isCollapsed && <Text style={styles.logoutButtonText}>Sair</Text>}
      </Pressable>
    </View>
  );
}
