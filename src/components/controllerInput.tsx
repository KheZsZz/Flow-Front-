import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "@/contexts/themeContext";
import { createInputStyles } from "@/styles/input.styles";
import { Feather } from "@expo/vector-icons";

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
        render={({ field: { onChange, value } }) => {
          // 1. VARIANT: SWITCH
          if (variant === "switch") {
            return (
              <View style={{ marginVertical: 8 }}>
                <Switch
                  value={!!value}
                  onValueChange={onChange}
                  trackColor={{ false: "#767577", true: theme.primary }}
                />
              </View>
            );
          }

          // 2. VARIANT: SELECT
          if (variant === "select") {
            return (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginVertical: 8,
                }}
              >
                {options.map((opt) => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    onPress={() => onChange(opt.value)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor:
                        value === opt.value
                          ? theme.primary
                          : theme.isDark
                            ? "#333"
                            : "#EEE",
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: value === opt.value ? "#FFF" : theme.text,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          }

          // 3. VARIANT: DATE
          if (variant === "date") {
            return (
              <View>
                <TouchableOpacity
                  style={[styles.inputWrapper, style]}
                  onPress={() => setShowDatePicker(true)}
                >
                  {iconName && (
                    <Feather
                      name={iconName}
                      size={18}
                      color={theme.text}
                      style={{ marginLeft: 12, marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.input,
                      {
                        paddingVertical: 12,
                        color: value ? theme.text : theme.textSecondary,
                      },
                    ]}
                  >
                    {value
                      ? new Date(value).toLocaleDateString()
                      : "Selecione uma data"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                      setShowDatePicker(false);
                      if (date) onChange(date.toISOString());
                    }}
                  />
                )}
              </View>
            );
          }

          // 4. VARIANT: NUMERIC
          if (variant === "numeric") {
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
                    style={{ marginLeft: 12, marginRight: 4 }}
                  />
                )}
                <TextInput
                  style={[styles.input]}
                  keyboardType="numeric"
                  onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))}
                  value={value !== undefined ? String(value) : ""}
                  placeholderTextColor={
                    theme.isDark ? theme.textSecondary : theme.text
                  }
                  {...textInputProps}
                />
              </View>
            );
          }

          // 5. VARIANT: TEXT (Padrão)
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
                  style={{ marginLeft: 12, marginRight: 4 }}
                />
              )}
              <TextInput
                style={[styles.input]}
                onChangeText={onChange}
                value={value !== undefined ? String(value) : ""}
                placeholderTextColor={
                  theme.isDark ? theme.textSecondary : theme.text
                }
                secureTextEntry={secureTextEntry ? passwordHidden : false}
                {...textInputProps}
              />
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
