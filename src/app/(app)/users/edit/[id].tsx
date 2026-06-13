import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserSchema, UpdateUserType } from "@/schemas/usersSchema";
import { useTheme } from "@/contexts/themeContext";
import { usePermissions } from "@/hooks/usePermission";
import { ControlledInput } from "@/components/controllerInput";
import { Loadding } from "@/components/loadding";
import { usersFormStyles } from "@/styles/users.styles";
import rollback from "@/services/rollback";
import { api } from "@/services/api";

const MANAGER_ROLES = [
  { label: "Usuário", value: "Commum" },
  { label: "Motorista", value: "Driver" },
  { label: "Solicitante", value: "Requestor" },
  { label: "Financeiro", value: "Financer" },
  { label: "Administrador", value: "Admin" },
  { label: "Gerente", value: "Manager" },
];

const ADMIN_ROLES = [
  { label: "Usuário", value: "Commum" },
  { label: "Motorista", value: "Driver" },
];

export default function EditUserScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const styles = usersFormStyles(theme, isMobile);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = usePermissions();
  const isManager = profile === "Manager";
  const roleOptions = isManager ? MANAGER_ROLES : ADMIN_ROLES;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserType>({
    resolver: zodResolver(UpdateUserSchema),
  });

  const fetchUser = async () => {
    try {
      const { data } = await api.get(`/users/${id}`);
      const u = Array.isArray(data) ? data[0] : data;
      if (!u) throw new Error("not found");
      reset({
        name_user: u.name_user,
        email_user: u.email_user,
        phone_user: u.phone_user,
        profile_user: u.profile_user ?? "Commum",
        is_active: u.is_active,
      });
    } catch {
      Alert.alert("Erro", "Usuário não encontrado.");
      rollback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const onSubmit = async (data: UpdateUserType) => {
    setSubmitting(true);
    try {
      const profile_user = isManager ? data.profile_user : data.profile_user;
      await api.put(`/users/${id}`, {
        name_user: data.name_user,
        email_user: data.email_user,
        phone_user: data.phone_user,
        profile_user,
        is_active: data.is_active,
      });
      Alert.alert("Sucesso", "Usuário atualizado com sucesso!");
      rollback();
    } catch {
      /* interceptor da api exibe o erro */
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.text} size={50} />
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather
            name="arrow-left"
            size={20}
            color={theme.isDark ? theme.text : "#fff"}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Usuário</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Dados</Text>

          <ControlledInput
            control={control}
            name="name_user"
            label="Nome completo"
            placeholder="Nome e sobrenome"
            iconName="user"
            errorMessage={errors.name_user?.message as string}
          />
          <ControlledInput
            control={control}
            name="email_user"
            label="E-mail"
            placeholder="usuario@empresa.com"
            iconName="envelope"
            errorMessage={errors.email_user?.message as string}
          />
          <ControlledInput
            control={control}
            name="phone_user"
            label="Telefone"
            placeholder="(XX) 9.XXXX-XXXX"
            mask="(99) 9.9999-9999"
            iconName="phone"
            errorMessage={errors.phone_user?.message as string}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Perfil de acesso</Text>
          {!isManager && (
            <Text style={styles.lockedHint}>
              Você pode definir apenas se o usuário é Motorista. A alteração de
              perfis administrativos é exclusiva do Gerente.
            </Text>
          )}
          <ControlledInput
            control={control}
            name="profile_user"
            variant="select"
            options={roleOptions}
            errorMessage={errors.profile_user?.message as string}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.lockedHint}>
            Usuários inativos não conseguem fazer login no aplicativo.
          </Text>
          <ControlledInput
            control={control}
            name="is_active"
            label="Usuário ativo"
            variant="switch"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
