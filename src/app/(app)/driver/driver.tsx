import React from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { createDashboardStyles } from "@/styles/dashboard.styles";
import { ROLE_COLOR, ROLE_LABEL } from "@/constants/colors";
import { DriverPanel } from "@/components/dashboard/DriverPanel";
import { FuelQuickEntry } from "@/components/driver/fuelQuickEntry";

export default function DriverScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createDashboardStyles(theme, isMobile);

  const roleColor = ROLE_COLOR.Driver;
  const roleLabel = ROLE_LABEL.Driver;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Meu painel</Text>
            <Text style={styles.subtitle}>
              Olá, {user?.user?.name_user ?? "motorista"} — suas viagens e
              entregas
            </Text>
          </View>
          <View
            style={[
              styles.roleTag,
              {
                backgroundColor: roleColor + "22",
                borderColor: roleColor + "55",
              },
            ]}
          >
            <Text style={[styles.roleTagText, { color: roleColor }]}>
              {roleLabel}
            </Text>
          </View>
        </View>

        <DriverPanel isMobile={isMobile} />
        <FuelQuickEntry />
      </ScrollView>
    </View>
  );
}
