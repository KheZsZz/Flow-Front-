import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { View, Text } from "react-native";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { UserSchema } from "@/schemas/usersSchema";
import { ControlledInput } from "@/components/controllerInput";
import { Button } from "@/components/button";
import { createLoginStyles } from "@/styles/login.styles";
import { api } from "@/services/api";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

const LoginValidationSchema = UserSchema.pick({
  email_user: true,
  password_user: true,
});

type LoginFormData = z.infer<typeof LoginValidationSchema>;

export default function LoginScreen() {
  const { singIn } = useAuth();
  const { theme } = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const styles = createLoginStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginValidationSchema),
    defaultValues: {
      email_user: "",
      password_user: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitting(true);
      const response = await api.post("/auth/signin", data);
      singIn({ token: response.data.token });
    } catch (error) {
      console.error("Erro na autenticação:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradient}
        locations={[0.1, 0.3, 1]}
        style={styles.gradient}
      />

      <BlurView
        intensity={30}
        tint={theme.isDark ? "dark" : "light"}
        style={styles.blur}
      />
      <View style={[styles.content]}>
        <View style={styles.headers}>
          <Image
            style={styles.image}
            source="https://picsum.photos/seed/696/3000/2000"
            placeholder="icone do sistema"
            contentFit="cover"
            transition={1000}
          />
          <Text style={styles.title}> Flow Transportes</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            SaaS Integrado de Monitoramento Logístico
          </Text>
        </View>
        <View style={styles.card}>
          <View style={styles.form}>
            <ControlledInput
              iconName="mail"
              control={control}
              name="email_user"
              label="E-mail"
              placeholder="Ex: teste@empresa.com.br"
              errorMessage={errors.email_user?.message}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <ControlledInput
              iconName="lock"
              control={control}
              name="password_user"
              label="Password"
              placeholder="Introduza a sua senha"
              errorMessage={errors.password_user?.message}
              secureTextEntry
            />
          </View>

          <Button
            title="Acessar Ecossistema"
            isLoading={submitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </View>
  );
}
