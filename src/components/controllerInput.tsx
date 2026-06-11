import React, { useState } from "react";
import {
  Platform,
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { MaskedTextInput } from "react-native-mask-text"; // Importação necessária
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createInputStyles } from "@/styles/input.styles";

interface ControlledInputProps<
  TFieldValues extends FieldValues,
> extends TextInputProps {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  errorMessage?: string;
  iconName?: React.ComponentProps<typeof Feather>["name"];
  variant?: "text" | "select" | "switch" | "date" | "numeric";
  options?: { label: string; value: any }[];
  disabled?: boolean; // Adicionado
  mask?: string; // Adicionado para suportar CNPJ/CPF/CEP
}

export function ControlledInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  errorMessage,
  iconName,
  variant = "text",
  options = [],
  style,
  secureTextEntry,
  disabled = false,
  mask,
  ...textInputProps
}: ControlledInputProps<TFieldValues>) {
  const { theme } = useTheme();
  const styles = createInputStyles(theme);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        disabled={disabled}
        render={({ field: { onChange, value } }) => {
          // 1. VARIANT: SWITCH
          if (variant === "switch") {
            return (
              <Switch
                value={!!value}
                onValueChange={onChange}
                disabled={disabled}
                trackColor={{ true: theme.primary }}
              />
            );
          }

          // 2. VARIANT: TEXT / NUMERIC / MASKED
          const renderInput = () => {
            const commonProps = {
              style: [styles.input],
              editable: !disabled,
              value: value !== undefined ? String(value) : "",
              placeholderTextColor: theme.isDark
                ? theme.textSecondary
                : theme.text,
              ...textInputProps,
            };

            if (mask) {
              return (
                <MaskedTextInput
                  {...commonProps}
                  mask={mask}
                  onChangeText={(text, rawText) => onChange(rawText)}
                  keyboardType="numeric"
                />
              );
            }

            return (
              <TextInput
                {...commonProps}
                keyboardType={
                  variant === "numeric"
                    ? "numeric"
                    : textInputProps.keyboardType
                }
                onChangeText={
                  variant === "numeric"
                    ? (t) => onChange(t.replace(/[^0-9]/g, ""))
                    : onChange
                }
                secureTextEntry={secureTextEntry ? passwordHidden : false}
              />
            );
          };

          return (
            <View
              style={[
                styles.inputWrapper,
                errorMessage ? { borderColor: theme.error } : null,
                style,
              ]}
            >
              {iconName && (
                <Feather
                  name={iconName}
                  size={18}
                  color={theme.text}
                  style={{ marginLeft: 12 }}
                />
              )}
              {renderInput()}

              {/* Ícone de olho para senha */}
              {secureTextEntry && (
                <TouchableOpacity
                  onPress={() => setPasswordHidden(!passwordHidden)}
                  style={{ paddingHorizontal: 12 }}
                >
                  <Feather
                    name={passwordHidden ? "eye-off" : "eye"}
                    size={18}
                    color={theme.text}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {errorMessage && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
