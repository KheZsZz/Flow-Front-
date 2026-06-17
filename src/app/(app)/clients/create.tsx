import React, { useState } from "react";
import rollback from "@/services/rollback";
import { api } from "@/services/api";
import { clientSchema, ClientType } from "@/schemas/clientsSchema";
import { Feather } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { useAuth } from "@/contexts/authContext";
import { listClientStyles } from "@/styles/clients.styles";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";

export default function CreateClientScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const isMobile = width < 768;
  const styles = listClientStyles(theme, isMobile);

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const onSubmit = async (data: ClientType) => {
    setLoading(true);
    try {
      await api.post("/clients", { ...data, created_by: user?.user.id });
      Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
      rollback();
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e.response?.data?.message || "Falha ao cadastrar o cliente.",
      );
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.title}>Novo Cliente</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Dados Principais */}
          <Text style={styles.sectionTitle}>Dados Principais</Text>

          <ControlledInput
            control={control}
            name="document"
            label="CPF / CNPJ"
            placeholder="Digite o CPF ou CNPJ"
            iconName="credit-card"
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
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.isDark ? theme.primary : "#fff"} />
          ) : (
            <Text style={styles.buttonText}>Cadastrar Cliente</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
