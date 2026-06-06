import React from "react";
import { View, ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { createLoadingStyles } from "@/styles/loadding.styles";

interface LoadingScreenProps {
  size?: ActivityIndicatorProps["size"];
  color?: string;
}

export function Loadding({ size = "large", color }: LoadingScreenProps) {
  const { theme } = useTheme();
  const styles = createLoadingStyles(theme);

  return (
    <View style={[styles.container]}>
      <ActivityIndicator
        size={size}
        color={theme.isDark ? theme.link : theme.text}
      />
    </View>
  );
}
