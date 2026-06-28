import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { usePermissions } from "@/hooks/usePermission";
import { createSettingsStyles } from "@/styles/settings.styles";
import { AccountSection } from "@/components/settings/accountSection";
import { GoalsSection } from "@/components/settings/goalsSection";
import { AlertsSection } from "@/components/settings/alertsSection";
import { AuditSection } from "@/components/settings/auditSection";

type TabKey = "account" | "goals" | "alerts" | "audit";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createSettingsStyles(theme, isMobile);
  const { hasMinRole } = usePermissions();
  const isAdmin = hasMinRole("Admin");

  const tabs = [
    {
      key: "account" as TabKey,
      label: "Minha Conta",
      icon: "user",
      show: true,
    },
    { key: "goals" as TabKey, label: "Metas", icon: "target", show: isAdmin },
    {
      key: "alerts" as TabKey,
      label: "Alertas",
      icon: "alert-triangle",
      show: isAdmin,
    },
    {
      key: "audit" as TabKey,
      label: "Auditoria",
      icon: "clock",
      show: isAdmin,
    },
  ].filter((t) => t.show);

  const [active, setActive] = useState<TabKey>("account");

  return (
    <View style={styles.container}>
      {/* ── Topo fixo: título + abas ───────────────────────── */}
      <View style={styles.topbar}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>
            Conta, metas, alertas e histórico de eventos
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBarScroll}
          contentContainerStyle={styles.tabBar}
        >
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActive(tab.key)}
              >
                <Feather
                  name={tab.icon as any}
                  size={15}
                  color={
                    isActive
                      ? theme.isDark
                        ? theme.primary
                        : "#fff"
                      : theme.text
                  }
                />
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Área rolável: só o conteúdo ────────────────────── */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {active === "account" && <AccountSection />}
          {active === "goals" && isAdmin && <GoalsSection />}
          {active === "alerts" && isAdmin && <AlertsSection />}
          {active === "audit" && isAdmin && <AuditSection />}
        </View>
      </ScrollView>
    </View>
  );
}
