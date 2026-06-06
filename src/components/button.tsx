import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";

import { useTheme } from "@/contexts/themeContext";
import { createButtonStyles } from "@/styles/button.styles";
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; 

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"]; 
}

export function Button({
  title,
  isLoading,
  style,
  disabled,
  icon,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = createButtonStyles(theme);

  const isButtonDisabled = disabled || isLoading;

  const isDark = theme.isDark; 


  const blurTint = isDark ? "dark" : "light";
  
  const dynamicGlassStyles = {
    backgroundColor: isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.15)",
    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.25)",
  };

  const contentColor = isDark ? "#ffffff" : theme.text || "#000000";

  return (
    <TouchableOpacity
      style={[
        styles.button,        
        isButtonDisabled ? { opacity: 0.4 } : null,
        style,
      ]}
      disabled={isButtonDisabled}
      activeOpacity={0.7}
      {...rest}
    >

      {isLoading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {icon && (
            <MaterialIcons 
              name={icon} 
              size={20} 
              color={contentColor} 
              style={{ marginRight: 8, zIndex: 1 }} 
            />
          )}
          <Text style={[styles.buttonText]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
