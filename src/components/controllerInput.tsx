import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaskedTextInput } from "react-native-mask-text";
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
  mask?: string;
  disabled?: boolean;
}

export function ControlledInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  errorMessage,
  iconName,
  variant = "text",
  options = [],
  mask,
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
                  trackColor={{ true: theme.primary }}
                />
              </View>
            );
          }

          // 2. VARIANT: SELECT (Lista de botões)
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
            if (variant === "date" && Platform.OS === "web") {
              return (
                <input
                  type="date"
                  value={
                    value ? new Date(value).toISOString().split("T")[0] : ""
                  }
                  onChange={(e) =>
                    onChange(new Date(e.target.value).toISOString())
                  }
                  style={styles.inputDate}
                />
              );
            }
            return (
              <>
                <TouchableOpacity
                  style={[styles.inputWrapper, style]}
                  onPress={() => setShowDatePicker(true)}
                >
                  {iconName && (
                    <Feather
                      name={iconName}
                      size={18}
                      color={theme.text}
                      style={{ marginLeft: 12 }}
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

                {/* Renderize fora do container se necessário, ou garanta a visibilidade */}
                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    {...(Platform.OS === "web"
                      ? { style: { display: "flex" } }
                      : {})}
                    onChange={(e: DateTimePickerEvent, date?: Date) => {
                      setShowDatePicker(false);
                      if (e.type === "set" && date) {
                        onChange(date.toISOString());
                      }
                    }}
                  />
                )}
              </>
            );
          }

          // 4. VARIANT: TEXT / NUMERIC / MASK
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

              {mask === "money" ? (
                <MaskedTextInput
                  {...textInputProps}
                  type="currency"
                  options={{
                    prefix: "R$ ",
                    decimalSeparator: ",",
                    groupSeparator: ".",
                    precision: 2,
                  }}
                  style={[styles.input]}
                  onChangeText={(text, rawText) => {
                    onChange(rawText);
                  }}
                  value={
                    value !== null && value !== undefined ? String(value) : ""
                  }
                  keyboardType="numeric"
                />
              ) : mask ? (
                <MaskedTextInput
                  {...textInputProps}
                  style={[styles.input]}
                  mask={mask}
                  onChangeText={(text, rawText) => onChange(rawText)}
                  value={value}
                  keyboardType="numeric"
                />
              ) : (
                <TextInput
                  {...textInputProps}
                  style={[styles.input]}
                  keyboardType={
                    variant === "numeric"
                      ? "decimal-pad"
                      : textInputProps.keyboardType
                  }
                  onChangeText={
                    variant === "numeric"
                      ? (t) => {
                          const formatted = t
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1");
                          onChange(formatted);
                        }
                      : onChange
                  }
                  value={
                    value !== null && value !== undefined ? String(value) : ""
                  }
                  secureTextEntry={secureTextEntry ? passwordHidden : false}
                />
              )}

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
