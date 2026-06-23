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
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createInputStyles } from "@/styles/input.styles";
import { PickerModal } from "@/components/pickerModal";

interface ControlledInputProps<
  TFieldValues extends FieldValues,
> extends TextInputProps {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  errorMessage?: string;
  iconName?: React.ComponentProps<typeof FontAwesome6>["name"];
  variant?:
    | "text"
    | "select"
    | "switch"
    | "date"
    | "numeric"
    | "dropDownList"
    | "multiSelect";
  options?: { label: string; value: any }[];
  mask?: string;
  disabled?: boolean;
  placeholder?: string;
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
  const [ddOpen, setDdOpen] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
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
                          ? theme.isDark ? theme.link : theme.primary
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

          if (variant === "dropDownList") {
            const selected = options?.find((o: any) => o.value === value);
            return (
              <View style={{ marginTop: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setDdOpen(true)}
                  style={styles.inputWrapper}
                >
                  <FontAwesome6
                    name={iconName ?? "list"}
                    size={16}
                    color={theme.isDark ? theme.textSecondary : theme.text}
                  />
                  <Text
                    style={{
                      flex: 1,
                      color: theme.isDark ? theme.textSecondary : theme.text,
                      marginLeft: 8,
                    }}
                    numberOfLines={1}
                  >
                    {selected ? selected.label : "Selecionar..."}
                  </Text>
                  <FontAwesome6
                    name="chevron-down"
                    size={14}
                    color={theme.isDark ? theme.textSecondary : theme.text}
                  />
                </TouchableOpacity>

                {!!errorMessage && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}

                <PickerModal
                  visible={ddOpen}
                  title={label ?? "Selecionar"}
                  onClose={() => setDdOpen(false)}
                  onSelect={(opt) => onChange(opt.id)}
                  load={async () =>
                    (options ?? []).map((o: any) => ({
                      id: o.value,
                      label: o.label,
                      sublabel: o.sublabel,
                    }))
                  }
                />
              </View>
            );
          }

          if (variant === "date") {
            if (Platform.OS === "web") {
              return (
                <View style={[styles.inputWrapper, style]}>
                  {iconName && (
                    <FontAwesome6
                      name={iconName}
                      size={18}
                      color={theme.text}
                      style={{ marginLeft: 12 }}
                    />
                  )}
                  <input
                    type="date"
                    value={
                      value ? new Date(value).toISOString().split("T")[0] : ""
                    }
                    onChange={(e) =>
                      onChange(new Date(e.target.value).toISOString())
                    }
                    style={styles.inputDate as any}
                  />
                </View>
              );
            }
            return (
              <>
                <TouchableOpacity
                  style={[styles.inputWrapper, style]}
                  onPress={() => setShowDatePicker(true)}
                >
                  {iconName && (
                    <FontAwesome6
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

          if (variant === "multiSelect") {
            const arr: any[] = Array.isArray(value) ? value : [];
            const toggle = (v: any) =>
              arr.includes(v)
                ? onChange(arr.filter((x) => x !== v))
                : onChange([...arr, v].sort());
            return (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginVertical: 8,
                }}
              >
                {options.map((opt) => {
                  const active = arr.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={String(opt.value)}
                      onPress={() => toggle(opt.value)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: active
                          ? theme.isDark ? theme.link : theme.primary
                          : theme.isDark
                            ? "#333"
                            : "#EEE",
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: active ? "#FFF" : theme.text }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          }

          // 4. VARIANT: TEXT / NUMERIC
          return (
            <View
              style={[
                styles.inputWrapper,
                errorMessage ? { borderColor: theme.error } : null,
                style,
              ]}
            >
              {iconName && (
                <FontAwesome6
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
                  <FontAwesome6
                    name={passwordHidden ? "eye-slash" : "eye"}
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
