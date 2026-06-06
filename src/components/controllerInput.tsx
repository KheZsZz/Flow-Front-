import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { createInputStyles } from "@/styles/input.styles";
import { Feather } from "@expo/vector-icons"; // Importando os ícones

interface ControlledInputProps<
  TFieldValues extends FieldValues,
> extends TextInputProps {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  errorMessage?: string;
  // Nova propriedade obrigatória para o ícone da esquerda
  iconName: React.ComponentProps<typeof Feather>["name"];
}

export function ControlledInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  errorMessage,
  style,
  iconName,
  secureTextEntry, // Capturamos o secureTextEntry original para controlar a lógica de senha
  ...textInputProps
}: ControlledInputProps<TFieldValues>) {
  const { theme } = useTheme();
  const styles = createInputStyles(theme);

  const [passwordHidden, setPasswordHidden] = useState(true);

  const activeIconColor = theme.text || "#0070f3";

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label]}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            style={[
              styles.inputWrapper,
              errorMessage ? { borderColor: theme.error } : null,
              style,
            ]}
          >
            <Feather
              name={iconName}
              size={18}
              color={theme.text}
              style={{ marginLeft: 12, marginRight: 4 }}
            />

            <TextInput
              style={[styles.input]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value !== undefined ? String(value) : ""}
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={secureTextEntry ? passwordHidden : false}
              {...textInputProps}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setPasswordHidden(!passwordHidden)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 12,
                  height: "100%",
                  justifyContent: "center",
                }}
              >
                <Feather
                  name={passwordHidden ? "eye-off" : "eye"}
                  size={18}
                  color={passwordHidden ? theme.text : activeIconColor}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {errorMessage && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
