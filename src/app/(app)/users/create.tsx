import React, { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterUserSchema, RegisterUserType } from "@/schemas/usersSchema";
import { useTheme } from "@/contexts/themeContext";
import { usePermissions } from "@/hooks/usePermission";
import { useAuth } from "@/contexts/authContext";
import { ControlledInput } from "@/components/controllerInput";
import { usersFormStyles } from "@/styles/users.styles";
import rollback from "@/services/rollback";
import { api } from "@/services/api";

/** Gerente pode atribuir qualquer perfil. */
const MANAGER_ROLES = [
  { label: "Usuário", value: "Commum" },
  { label: "Motorista", value: "Driver" },
  { label: "Solicitante", value: "Requestor" },
  { label: "Financeiro", value: "Financer" },
  { label: "Administrador", value: "Admin" },
  { label: "Gerente", value: "Manager" },
];

/** Admin só define se é motorista ou não. */
const ADMIN_ROLES = [
  { label: "Usuário", value: "Commum" },
  { label: "Motorista", value: "Driver" },
];

export default function CreateUserScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const styles = usersFormStyles(theme, isMobile);

  const { user } = useAuth();
  const { profile } = usePermissions();
  const isManager = profile === "Manager";
  const roleOptions = isManager ? MANAGER_ROLES : ADMIN_ROLES;

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserType>({
    resolver: zodResolver(RegisterUserSchema),
    defaultValues: {
      profile_user: "Commum", // todo novo usuário nasce como "Usuário"
    },
  });

  const onSubmit = async (data: RegisterUserType) => {
    setLoading(true);
    try {
      // Reforço no cliente: quem não é Gerente não eleva perfil
      const profile_user = isManager ? data.profile_user : "Commum";
      await api.post("/users", {
        name_user: data.name_user,
        email_user: data.email_user,
        password_user: data.password_user,
        phone_user: data.phone_user,
        profile_user,
        created_by: user?.user.id,
      });
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      rollback();
    } catch {
      /* interceptor da api exibe o erro */
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.title}>Novo Usuário</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Dados de acesso</Text>

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
          <ControlledInput
            control={control}
            name="password_user"
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            iconName="lock"
            secureTextEntry
            errorMessage={errors.password_user?.message as string}
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

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar Usuário</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
