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
import {
  clientSchema,
  ClientType,
  ClientInputType,
} from "@/schemas/clientsSchema";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";
import { ControlledInput } from "@/components/controllerInput";
import rollback from "@/services/rollback";
import { Loadding } from "@/components/loadding";
import { listClientStyles } from "@/styles/clients.styles";

export default function EditClientScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const styles = listClientStyles(theme, isMobile);

  const { document } = useLocalSearchParams<{ document: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [client, setClient] = useState<ClientType | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientInputType>({
    resolver: zodResolver(clientSchema),
  });

  const fetchClient = async () => {
    try {
      const { data } = await api.get(`/clients/document/${document}`);
      setClient(data);
      reset({
        ...data,
        address: {
          ...data.address,
          zip_code: data.address?.zip_code?.replace(/\D/g, "") ?? "",
        },
      });
    } catch {
      Alert.alert("Erro", "Cliente não encontrado.");
      rollback();
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClientType) => {
    setSubmitting(true);
    try {
      const payload = {
        id: data.id,
        document: data.document,
        name_client: data.name_client,
        email: data.email,
        phone: data.phone,
        is_active: data.is_active,
        address: data.address,
      };

      await api.put(`/clients/${data.id}`, payload);
      Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      rollback();
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Não foi possível atualizar o cliente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (document) fetchClient();
  }, [document]);

  const formatDate = (date?: Date | string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
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
            name="chevron-left"
            size={20}
            color={theme.isDark ? theme.primary : "#fff"}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Cliente</Text>
        {client && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: client.is_active
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.15)",
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: client.is_active ? "#22c55e" : "#ef4444" },
              ]}
            >
              {client.is_active ? "Ativo" : "Inativo"}
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Info de auditoria */}
          {client && (
            <View style={styles.infoCard}>
              {client.updated_at && (
                <View style={styles.infoRow}>
                  <Feather
                    name="refresh-cw"
                    size={13}
                    color={theme.isDark ? "#aaa" : "#666"}
                  />
                  <Text style={styles.infoLabel}>
                    Última atualização:{" "}
                    <Text style={styles.infoValue}>
                      {formatDate(client.updated_at)}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Dados Principais */}
          <Text style={styles.sectionTitle}>Dados Principais</Text>

          <ControlledInput
            control={control}
            name="document"
            label="CPF / CNPJ"
            placeholder="Digite o CPF ou CNPJ"
            iconName="credit-card"
            mask={
              document.length === 11 ? "9.999.999-999" : "99.999.999/9999-99"
            }
            errorMessage={errors.document?.message as string}
          />

          <ControlledInput
            control={control}
            name="name_client"
            label="Nome / Razão Social"
            placeholder="Digite o nome completo ou razão social"
            iconName="user"
            errorMessage={errors.name_client?.message as string}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <ControlledInput
                control={control}
                name="phone"
                label="Telefone"
                placeholder="(XX) 9.XXXX-XXXX"
                mask="(99) 9.9999-9999"
                iconName="phone"
                errorMessage={errors.phone?.message as string}
              />
            </View>
            <View style={styles.rowItem}>
              <ControlledInput
                control={control}
                name="email"
                label="E-mail"
                placeholder="contato@empresa.com"
                iconName="mail"
                errorMessage={errors.email?.message as string}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Endereço */}
          <Text style={styles.sectionTitle}>Endereço</Text>

          <View style={styles.row}>
            <View style={{ flex: isMobile ? undefined : 1 }}>
              <ControlledInput
                control={control}
                name="address.zip_code"
                label="CEP"
                placeholder="XXXXX-XXX"
                mask="99999-999"
                iconName="map-pin"
                errorMessage={errors.address?.zip_code?.message as string}
              />
            </View>
            <View style={{ flex: isMobile ? undefined : 2 }}>
              <ControlledInput
                control={control}
                name="address.street"
                label="Rua"
                placeholder="Digite a rua"
                iconName="map"
                errorMessage={errors.address?.street?.message as string}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <ControlledInput
                control={control}
                name="address.number"
                label="Número"
                placeholder="Nº"
                iconName="hash"
                errorMessage={errors.address?.number?.message as string}
              />
            </View>
            <View style={styles.rowItem}>
              <ControlledInput
                control={control}
                name="address.neighborhood"
                label="Bairro"
                placeholder="Digite o bairro"
                iconName="grid"
                errorMessage={errors.address?.neighborhood?.message as string}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <ControlledInput
                control={control}
                name="address.city"
                label="Cidade"
                placeholder="Digite a cidade"
                iconName="navigation"
                errorMessage={errors.address?.city?.message as string}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ControlledInput
                control={control}
                name="address.state"
                label="UF"
                placeholder="SP"
                maxLength={2}
                iconName="flag"
                errorMessage={errors.address?.state?.message as string}
              />
            </View>
          </View>

          <ControlledInput
            control={control}
            name="address.complement"
            label="Complemento"
            placeholder="Apto, sala, bloco..."
            iconName="info"
            errorMessage={errors.address?.complement?.message as string}
          />

          <ControlledInput
            control={control}
            name="is_active"
            label="Cliente ativo:"
            iconName="info"
            variant="switch"
            // onPress={handleToggleStatus}
            errorMessage={errors.address?.complement?.message as string}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator
                color={theme.isDark ? theme.primary : "#fff"}
              />
            ) : (
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
