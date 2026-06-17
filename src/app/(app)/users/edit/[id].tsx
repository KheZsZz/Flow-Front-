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
    watch,
    formState: { errors },
  } = useForm<UpdateUserType>({
    resolver: zodResolver(UpdateUserSchema),
  });

  const isDriver = watch("profile_user") === "Driver";
  const fetchUser = async () => {
    try {
      const { data } = await api.get(`/users/${id}`);
      const u = Array.isArray(data) ? data[0] : data;
      if (!u) throw new Error("not found");
      const drv = Array.isArray(u.drivers) ? u.drivers[0] : u.drivers;
      reset({
        name_user: u.name_user,
        email_user: u.email_user,
        phone_user: u.phone_user,
        profile_user: u.profile_user ?? "Commum",
        is_active: u.is_active,
        cnh: drv?.cnh ?? "",
        validade_cnh: drv?.validade_cnh ?? "",
        categoria_cnh: drv?.categoria_cnh
          ? String(drv.categoria_cnh)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        mopp: !!drv?.mopp,
        moop_validade: drv?.moop_validade ?? "",
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
      const profile_user = isManager
        ? data.profile_user
        : ALLOWED_NON_MANAGER.includes(data.profile_user as string)
          ? data.profile_user
          : "Commum";

      const payload: any = {
        name_user: data.name_user,
        email_user: data.email_user,
        phone_user: data.phone_user,
        profile_user,
        is_active: data.is_active,
      };

      if (profile_user === "Driver") {
        payload.cnh = data.cnh;
        payload.validade_cnh = data.validade_cnh;
        payload.categoria_cnh = (data.categoria_cnh ?? []).join(",");
        payload.mopp = !!data.mopp;
        payload.moop_validade = data.moop_validade || null;
      }

      await api.put(`/users/${id}`, payload);
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
          {isDriver && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Dados do Motorista</Text>

              <ControlledInput
                control={control}
                name="cnh"
                label="CNH"
                placeholder="Número da CNH"
                iconName="id-card"
                errorMessage={errors.cnh?.message as string}
              />
              <ControlledInput
                control={control}
                name="categoria_cnh"
                label="Categoria (pode selecionar várias)"
                variant="multiSelect"
                options={CNH_CATEGORIES}
                errorMessage={errors.categoria_cnh?.message as string}
              />
              <ControlledInput
                control={control}
                name="validade_cnh"
                label="Validade da CNH"
                variant="date"
                iconName="calendar"
                errorMessage={errors.validade_cnh?.message as string}
              />
              <ControlledInput
                control={control}
                name="mopp"
                label="Possui MOPP"
                variant="switch"
              />
              <ControlledInput
                control={control}
                name="moop_validade"
                label="Validade do MOPP (opcional)"
                variant="date"
                iconName="calendar"
              />
            </>
          )}

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
