import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { createSettingsStyles } from "@/styles/settings.styles";
import { ControlledInput } from "@/components/controllerInput";
import { api } from "@/services/api";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Informe a senha atual"),
    new_password: z
      .string()
      .min(8, "A nova senha deve ter no mínimo 8 caracteres")
      .refine((v) => /[A-Z]/.test(v), "Precisa de ao menos uma letra maiúscula")
      .refine((v) => /\d/.test(v), "Precisa de ao menos um número"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "As senhas não coincidem",
  });

type PasswordForm = z.infer<typeof passwordSchema>;

const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/bottts/svg";

export function AccountSection() {
  const { theme } = useTheme();
  const styles = createSettingsStyles(theme, false);
  const { user } = useAuth();

  const [avatar, setAvatar] = useState<string>(
    user?.user?.avatar_url || FALLBACK_AVATAR,
  );
  const [uploading, setUploading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso às suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop() || "jpg";

    const form = new FormData();
    form.append("avatar", {
      uri: asset.uri,
      name: `avatar.${ext}`,
      type: asset.mimeType || "image/jpeg",
    } as any);

    setUploading(true);
    try {
      const res = await api.post("/users/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.avatar_url) setAvatar(res.data.avatar_url);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (err) {
      // O interceptor do api já exibe o toast de erro
    } finally {
      setUploading(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      await api.put("/auth/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      reset();
    } catch (err) {
      // toast via interceptor
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <View>
      {/* ── Avatar ───────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Foto de perfil</Text>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={pickAndUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.link} />
          ) : (
            <>
              <Feather name="camera" size={16} color={theme.link} />
              <Text style={styles.secondaryBtnText}>Trocar foto</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* ── Senha ────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Alterar senha</Text>
      <Text style={styles.sectionHint}>
        Mínimo 8 caracteres, com pelo menos uma maiúscula e um número.
      </Text>

      <ControlledInput
        control={control}
        name="current_password"
        label="Senha atual"
        iconName="lock"
        secureTextEntry
        errorMessage={errors.current_password?.message as string}
      />
      <ControlledInput
        control={control}
        name="new_password"
        label="Nova senha"
        iconName="lock"
        secureTextEntry
        errorMessage={errors.new_password?.message as string}
      />
      <ControlledInput
        control={control}
        name="confirm_password"
        label="Confirmar nova senha"
        iconName="lock"
        secureTextEntry
        errorMessage={errors.confirm_password?.message as string}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onChangePassword)}
        disabled={savingPassword}
      >
        {savingPassword ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar nova senha</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
