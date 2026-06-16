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
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { ClientPickerModal, PickedClient } from "@/components/clientPicker";
import {
  collectionFormSchema,
  CollectionFormInput,
} from "@/schemas/collectionsSchema";
import { collectionService } from "@/services/collections";
import { createCollectionStyles } from "@/styles/collections.styles";
import { Loadding } from "@/components/loadding";
import rollback from "@/services/rollback";

export default function EditCollectionScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createCollectionStyles(theme, isMobile);

  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [client, setClient] = useState<PickedClient | null>(null);
  const [meta, setMeta] = useState<{
    code?: string;
    status?: any;
    is_active?: boolean;
  }>({});

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionFormSchema),
  });

  const fetchCollection = async () => {
    try {
      const data = await collectionService.getById(id);
      setMeta({
        code: data.code,
        status: data.status,
        is_active: data.is_active,
      });
      if (data.clients) {
        setClient({
          id: data.clients.id,
          name_client: data.clients.name_client,
          document: data.clients.document,
        });
      }
      reset({
        client_id: data.clients?.id ?? "",
        collection_address: data.collection_address ?? "",
        quantity:
          data.quantity !== null && data.quantity !== undefined
            ? String(data.quantity)
            : "",
        weight:
          data.weight !== null && data.weight !== undefined
            ? String(data.weight)
            : "",
        description: data.description ?? "",
        scheduled_date: data.scheduled_date ?? "",
      });
    } catch {
      Alert.alert("Erro", "Coleta não encontrada.");
      rollback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const handlePick = (c: PickedClient) => {
    setClient(c);
    setValue("client_id", c.id, { shouldValidate: true });
  };

  const onSubmit = async (data: CollectionFormInput) => {
    setSubmitting(true);
    try {
      await collectionService.update(id, {
        client_id: data.client_id,
        collection_address: data.collection_address?.trim()
          ? data.collection_address
          : undefined,
        quantity: data.quantity ? Number(data.quantity) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        description: data.description?.trim() ? data.description : undefined,
        scheduled_date: data.scheduled_date || undefined,
      });
      Alert.alert("Sucesso", "Coleta atualizada com sucesso!");
      rollback();
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Não foi possível atualizar a coleta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = () => {
    Alert.alert(
      meta.is_active ? "Inativar coleta" : "Ativar coleta",
      `Deseja realmente ${meta.is_active ? "inativar" : "ativar"} esta coleta?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: meta.is_active ? "destructive" : "default",
          onPress: async () => {
            try {
              await collectionService.toggle(id, !meta.is_active);
              fetchCollection();
            } catch {
              Alert.alert("Erro", "Não foi possível alterar o status.");
            }
          },
        },
      ],
    );
  };

  if (loading) return <Loadding />;

  const concluded = meta.status?.code === 102;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather
            name="arrow-left"
            size={22}
            color={theme.isDark ? theme.textSecondary : theme.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Coleta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.readonlyRow}>
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyLabel}>Código</Text>
              <Text style={styles.readonlyValue}>{meta.code ?? "—"}</Text>
            </View>
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyLabel}>Status</Text>
              <Text style={styles.readonlyValue}>
                {meta.status?.name ?? "—"}
              </Text>
            </View>
          </View>

          {concluded && (
            <Text style={styles.lockedHint}>
              Coleta concluída — alterações estão bloqueadas.
            </Text>
          )}

          <Text style={styles.label}>Cliente</Text>
          <TouchableOpacity
            style={[styles.pickerField, concluded && styles.disabledField]}
            onPress={() => !concluded && setPickerVisible(true)}
            disabled={concluded}
          >
            <Feather name="user" size={16} color={theme.textSecondary} />
            <Text
              style={client ? styles.pickerFieldText : styles.pickerPlaceholder}
            >
              {client ? client.name_client : "Selecionar cliente"}
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          {!!errors.client_id && (
            <Text style={styles.errorText}>
              {errors.client_id.message as string}
            </Text>
          )}

          <ControlledInput
            control={control}
            name="collection_address"
            label="Endereço de coleta"
            placeholder="Rua, número, bairro, cidade/UF"
            iconName="map-pin"
            multiline
            errorMessage={errors.collection_address?.message as string}
          />

          <ControlledInput
            control={control}
            name="quantity"
            label="Quantidade (volumes)"
            placeholder="Ex: 10"
            iconName="package"
            variant="numeric"
            errorMessage={errors.quantity?.message as string}
          />

          <ControlledInput
            control={control}
            name="weight"
            label="Peso (kg)"
            placeholder="Ex: 250"
            iconName="bar-chart-2"
            variant="numeric"
            errorMessage={errors.weight?.message as string}
          />

          <ControlledInput
            control={control}
            name="scheduled_date"
            label="Data agendada"
            variant="date"
            iconName="calendar"
          />

          <ControlledInput
            control={control}
            name="description"
            label="Descrição"
            placeholder="Observações da coleta (opcional)"
            multiline
            errorMessage={errors.description?.message as string}
          />

          <TouchableOpacity
            style={[styles.button, concluded && styles.disabledField]}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting || concluded}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              { backgroundColor: meta.is_active ? theme.error : theme.primary },
            ]}
            onPress={toggleActive}
          >
            <Feather
              name={meta.is_active ? "slash" : "check-circle"}
              size={16}
              color="#fff"
            />
            <Text style={styles.toggleBtnText}>
              {meta.is_active ? "Inativar coleta" : "Ativar coleta"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ClientPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handlePick}
      />
    </View>
  );
}
