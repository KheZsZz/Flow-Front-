import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/themeContext";
import { usePermissions } from "@/hooks/usePermission";
import { UserType } from "@/services/schemas/usersSchemaersSchema";
import { Loadding } from "@/components/loadding";
import { createUsersStyles } from "@/styles/users.styles";
import { ROLE_LABEL, ROLE_COLOR } from "@/constants/colors";
import { usersService } from "@/services/users";
import { SearchField } from "@/components/searchField";
import { useUsers, listKeys } from "@/hooks/querys/useListData";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { UserTypeEnum } from "@/services/schemas/enumSchemanumSchema";

export default function UsersListScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width <= 820;
  const styles = createUsersStyles(theme, isMobile);
  const router = useRouter();
  const { isAdmin } = usePermissions();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch } = useUsers();
  useRefreshOnFocus(refetch);

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return users.filter(
      (u: UserType) =>
        u.name_user?.toLowerCase().includes(lower) ||
        u.email_user?.toLowerCase().includes(lower),
    );
  }, [search, users]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: listKeys.users });

  const toggleStatus = (user: UserType) => {
    const turningOff = user.is_active;
    Alert.alert(
      turningOff ? "Desativar usuário" : "Ativar usuário",
      `Deseja realmente ${turningOff ? "desativar" : "ativar"} ${user.name_user}?` +
        (turningOff ? "\nUsuários desativados não conseguem fazer login." : ""),
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: turningOff ? "destructive" : "default",
          onPress: async () => {
            try {
              await usersService.toggleActive(
                user.id as string,
                !user.is_active,
              );
              invalidate(); // substitui o fetchUsers() manual
            } catch {}
          },
        },
      ],
    );
  };
  if (isLoading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.text} size={50} />
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuários</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/users/create")}
          >
            <Feather name="plus" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <SearchField
        placeholder="Buscar por nome ou e-mail..."
        onChange={setSearch}
      />

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
      ) : (
        <View style={styles.gridContainer}>
          {filtered.map((user, index) => {
            const role = (user.profile_user ?? "Commum") as UserTypeEnum;
            const roleColor = ROLE_COLOR[role];
            return (
              <View
                key={user.id ?? user.email_user ?? index}
                style={styles.card}
              >
                <View
                  style={[
                    styles.cardHeader,
                    {
                      borderBottomColor: user.is_active ? roleColor : "#ef4444",
                    },
                  ]}
                >
                  <View style={styles.avatar}>
                    <Feather
                      name="user"
                      size={20}
                      color={theme.isDark ? "#60a5fa" : "#1a73e8"}
                    />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.userName}>{user.name_user}</Text>
                    <Text style={styles.userEmail}>{user.email_user}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: user.is_active
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: user.is_active ? "#10b981" : "#ef4444" },
                      ]}
                    >
                      {user.is_active ? "Ativo" : "Inativo"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Feather
                      name="phone"
                      size={14}
                      color={theme.isDark ? "#aaa" : "#666"}
                    />
                    <Text style={styles.infoText}>
                      {user.phone_user || "—"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: roleColor + "26" },
                    ]}
                  >
                    <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                      {ROLE_LABEL[role]}
                    </Text>
                  </View>
                </View>

                {isAdmin && (
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => router.push(`/users/edit/${user.id}`)}
                    >
                      <Feather
                        name="edit-2"
                        size={14}
                        color={theme.isDark ? "#60a5fa" : "#1a73e8"}
                      />
                      <Text style={styles.editBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        {
                          backgroundColor: user.is_active
                            ? "#ef4444"
                            : "#10b981",
                        },
                      ]}
                      onPress={() => toggleStatus(user)}
                    >
                      <Feather
                        name={user.is_active ? "user-x" : "user-check"}
                        size={14}
                        color="#fff"
                      />
                      <Text style={styles.toggleBtnText}>
                        {user.is_active ? "Desativar" : "Ativar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
