import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { Feather } from "@expo/vector-icons";
import { createNavbarStyles } from "@/styles/navbar.styles";
import { useTheme, ThemeMode } from "@/contexts/themeContext";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const THEME_OPTIONS: { id: ThemeMode; icon: "sun" | "moon"; label: string }[] =
  [
    { id: "light", icon: "sun", label: "Claro" },
    { id: "dark", icon: "moon", label: "Escuro" },
  ];

const MENU_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: "grid" },
  { name: "Notas Fiscais", path: "/invoices", icon: "file-text" },
  { name: "Frota", path: "/vehicles/list", icon: "truck" },
  { name: "Manutenção", path: "/fuel", icon: "tool" },
  { name: "Motoristas", path: "/drives", icon: "users" },
  { name: "Cargas / Rotas", path: "/orders", icon: "truck" },
  { name: "Configurações", path: "/settings", icon: "settings" },
] as const;

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { mode, isDark, setThemeMode, theme } = useTheme();
  const styles = createNavbarStyles(theme);

  if (!theme) return null;

  const trackBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const activeBg = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)";

  if (collapsed) {
    const next = mode === "dark" ? "light" : "dark";
    const current =
      THEME_OPTIONS.find((o) => o.id === mode) ?? THEME_OPTIONS[0];

    return (
      <Pressable
        onPress={() => setThemeMode(next)}
        style={[styles.themeOptionCollapsed, { backgroundColor: trackBg }]}
      >
        <Feather name={current?.icon} size={16} color={theme?.textSecondary} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.themeTrack, { backgroundColor: trackBg }]}>
      {THEME_OPTIONS.map((opt) => {
        const isActive = mode === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => setThemeMode(opt.id)}
            style={[
              styles.themeOption,
              { backgroundColor: isActive ? activeBg : "transparent" },
            ]}
          >
            <Feather
              name={opt.icon}
              size={13}
              color={isActive ? theme.text : theme.textSecondary}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? theme.text : theme.textSecondary,
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({
  isCollapsed,
  onToggle,
  onNavigate,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { theme } = useTheme();
  const styles = createNavbarStyles(theme);
  const { user, singOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleNav = (path: string) => {
    router.push(path as any);
    onNavigate?.();
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Header */}
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
            name={isCollapsed ? "chevrons-right" : "x-circle"}
            size={20}
            color={theme.text}
          />
        </Pressable>
      </View>

      {/* Theme toggle — abaixo do header */}
      <ThemeToggle collapsed={isCollapsed} />

      {/* User badge */}
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

      {/* Menu */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Pressable
              key={item.path}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
                isCollapsed && styles.menuItemCollapsed,
              ]}
              onPress={() => handleNav(item.path)}
            >
              <Feather
                name={item.icon as any}
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

      {/* Logout */}
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
    </ScrollView>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { theme } = useTheme();
  const styles = createNavbarStyles(theme);
  const { width, height } = useWindowDimensions();

  const isMobile = width < 768 || height < 720;

  if (isMobile) {
    return (
      <>
        <Pressable onPress={onToggle} style={styles.hamburger}>
          <Feather
            name={isCollapsed ? "menu" : "x"}
            size={22}
            color={theme.text}
          />
        </Pressable>

        <Modal
          visible={!isCollapsed}
          animationType="slide"
          transparent={false}
          onRequestClose={onToggle}
        >
          <View style={[styles.sidebar, { width: "100%", flex: 1 }]}>
            <SidebarContent
              isCollapsed={false}
              onToggle={onToggle}
              onNavigate={onToggle}
            />
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={[styles.sidebar, isCollapsed && styles.sidebarCollapsed]}>
      <SidebarContent isCollapsed={isCollapsed} onToggle={onToggle} />
    </View>
  );
}
