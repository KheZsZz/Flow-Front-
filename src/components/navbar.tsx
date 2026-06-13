import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { Feather } from "@expo/vector-icons";
import { useTheme, ThemeMode } from "@/contexts/themeContext";
import { usePermissions } from "@/hooks/usePermission";
import { createNavbarStyles } from "@/styles/navbar.styles";
import { UserTypeEnum } from "@/schemas/enumSchema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THEME_OPTIONS: { id: ThemeMode; icon: "sun" | "moon"; label: string }[] =
  [
    { id: "light", icon: "sun", label: "Claro" },
    { id: "dark", icon: "moon", label: "Escuro" },
  ];

type MenuItem = {
  name: string;
  path: string;
  icon: string;
  minRole: UserTypeEnum;
};

const MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: "grid", minRole: "Financer" },
  {
    name: "Notas Fiscais",
    path: "/invoices",
    icon: "file-text",
    minRole: "Financer",
  },
  {
    name: "Cargas / Rotas",
    path: "/orders",
    icon: "package",
    minRole: "Requestor",
  },
  { name: "Frota", path: "/vehicles/list", icon: "truck", minRole: "Admin" },
  { name: "Manutenção", path: "/fuel", icon: "tool", minRole: "Admin" },
  { name: "Motoristas", path: "/drives", icon: "users", minRole: "Admin" },
  { name: "Clientes", path: "/clients", icon: "briefcase", minRole: "Admin" },
  {
    name: "Configurações",
    path: "/settings",
    icon: "settings",
    minRole: "Admin",
  },
];

const ROLE_LABEL: Record<UserTypeEnum, string> = {
  Manager: "Gerente",
  Admin: "Administrador",
  Financer: "Financeiro",
  Requestor: "Solicitante",
  Driver: "Motorista",
  Commum: "Usuário",
};

const ROLE_COLOR: Record<UserTypeEnum, string> = {
  Manager: "#f7cc3e",
  Admin: "#60a5fa",
  Financer: "#34d399",
  Requestor: "#a78bfa",
  Driver: "#fb923c",
  Commum: "#9ca3af",
};

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { mode, isDark, setThemeMode, theme } = useTheme();
  const styles = createNavbarStyles(theme);

  const trackBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const activeBg = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.10)";

  if (collapsed) {
    const next = mode === "dark" ? "light" : "dark";
    const current =
      THEME_OPTIONS.find((o) => o.id === mode) ?? THEME_OPTIONS[0];
    return (
      <Pressable
        onPress={() => setThemeMode(next)}
        style={[styles.themeOptionCollapsed, { backgroundColor: trackBg }]}
      >
        <Feather name={current.icon} size={16} color="rgba(255,255,255,0.6)" />
      </Pressable>
    );
  }

  return (
    <View style={[styles.themeTrack, { backgroundColor: trackBg }]}>
      {THEME_OPTIONS.map((opt) => {
        const active = mode === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => setThemeMode(opt.id)}
            style={[
              styles.themeOption,
              { backgroundColor: active ? activeBg : "transparent" },
            ]}
          >
            <Feather
              name={opt.icon}
              size={13}
              color={active ? "#fff" : "rgba(255,255,255,0.45)"}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  fontWeight: active ? "600" : "400",
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

// ─── User Badge ───────────────────────────────────────────────────────────────

function UserBadge() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createNavbarStyles(theme);

  if (!user) return null;

  const profile = (user.user.profile_user ?? "Commum") as UserTypeEnum;
  const roleColor = ROLE_COLOR[profile];
  const roleLabel = ROLE_LABEL[profile];
  const initials = user.user.name_user
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <View style={styles.userBadge}>
      {user.user.avatar_url ? (
        <Image
          source={{ uri: user.user.avatar_url }}
          style={styles.userAvatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.avatarFallback, { borderColor: roleColor }]}>
          <Text style={[styles.avatarInitials, { color: roleColor }]}>
            {initials}
          </Text>
        </View>
      )}
      <Text style={styles.userName} numberOfLines={1}>
        {user.user.name_user}
      </Text>
      <View
        style={[
          styles.roleBadge,
          {
            backgroundColor: roleColor + "22",
            borderColor: roleColor + "55",
          },
        ]}
      >
        <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
      </View>
    </View>
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function Menu({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { theme } = useTheme();
  const styles = createNavbarStyles(theme);
  const router = useRouter();
  const pathname = usePathname();
  const { hasMinRole } = usePermissions();

  const visibleItems = MENU_ITEMS.filter((item) => hasMinRole(item.minRole));

  const handleNav = (path: string) => {
    router.push(path as any);
    onNavigate?.();
  };

  return (
    <View style={styles.menuContainer}>
      {visibleItems.map((item) => {
        const active =
          pathname === item.path || pathname.startsWith(item.path + "/");
        return (
          <Pressable
            key={item.path}
            onPress={() => handleNav(item.path)}
            style={({ pressed }) => [
              styles.menuItem,
              collapsed && styles.menuItemCollapsed,
              active && styles.menuItemActive,
              pressed && styles.menuItemPressed,
            ]}
          >
            <Feather
              name={item.icon as any}
              size={18}
              color={active ? "#fff" : "rgba(255,255,255,0.5)"}
            />
            {!collapsed && (
              <Text
                style={[
                  styles.menuItemText,
                  active && styles.menuItemTextActive,
                ]}
              >
                {item.name}
              </Text>
            )}
            {active && !collapsed && <View style={styles.activeIndicator} />}
          </Pressable>
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
  const { singOut, user } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
      >
        {/* Header */}
        <View
          style={[
            styles.headerContainer,
            isCollapsed && styles.headerContainerCollapsed,
          ]}
        >
          {!isCollapsed && (
            <Text style={styles.logoText} numberOfLines={1}>
              {user?.company?.name?.split(" ")[0] ?? "Flow"}
            </Text>
          )}
          <Pressable onPress={onToggle} style={styles.toggleButton}>
            <Feather
              name={isCollapsed ? "chevrons-right" : "chevrons-left"}
              size={18}
              color="rgba(255,255,255,0.7)"
            />
          </Pressable>
        </View>

        {/* Theme Toggle */}
        <ThemeToggle collapsed={isCollapsed} />

        {/* User Badge */}
        {!isCollapsed ? (
          <UserBadge />
        ) : (
          <View style={styles.avatarCollapsed}>
            <View style={styles.avatarFallbackSm}>
              <Feather name="user" size={16} color="rgba(255,255,255,0.6)" />
            </View>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu */}
        <Menu collapsed={isCollapsed} onNavigate={onNavigate} />
      </ScrollView>

      {/* Logout */}
      <Pressable
        onPress={singOut}
        style={({ pressed }) => [
          styles.logoutButton,
          isCollapsed && styles.logoutButtonCollapsed,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Feather name="log-out" size={18} color="#fff" />
        {!isCollapsed && <Text style={styles.logoutButtonText}>Sair</Text>}
      </Pressable>
    </View>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { theme } = useTheme();
  const styles = createNavbarStyles(theme);
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  if (isMobile) {
    return (
      <>
        <Pressable onPress={onToggle} style={styles.hamburger}>
          <Feather name={isCollapsed ? "menu" : "x"} size={22} color="#fff" />
        </Pressable>

        <Modal
          visible={!isCollapsed}
          animationType="slide"
          transparent={false}
          onRequestClose={onToggle}
        >
          <View style={styles.mobileSidebar}>
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
