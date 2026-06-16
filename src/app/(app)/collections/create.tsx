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
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { ClientPickerModal, PickedClient } from "@/components/clientPicker";
import {
  collectionFormSchema,
  CollectionFormInput,
} from "@/schemas/collectionsSchema";
import { collectionService } from "@/services/collections";
import { createCollectionStyles } from "@/styles/collections.styles";
import rollback from "@/services/rollback";

export default function CreateCollectionScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createCollectionStyles(theme, isMobile);

  const [submitting, setSubmitting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [client, setClient] = useState<PickedClient | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      client_id: "",
      collection_address: "",
      quantity: "",
      weight: "",
      description: "",
      scheduled_date: "",
    },
  });

  const handlePick = (c: PickedClient) => {
    setClient(c);
    setValue("client_id", c.id, { shouldValidate: true });
  };

  const onSubmit = async (data: CollectionFormInput) => {
    setSubmitting(true);
    try {
      await collectionService.create({
        client_id: data.client_id,
        collection_address: data.collection_address?.trim()
          ? data.collection_address
          : undefined,
        quantity: data.quantity ? Number(data.quantity) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        description: data.description?.trim() ? data.description : undefined,
        scheduled_date: data.scheduled_date || undefined,
      });
      Alert.alert("Sucesso", "Coleta emitida com sucesso!");
      rollback();
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Falha ao emitir a coleta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.title}>Nova Coleta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.label}>Cliente</Text>
          <TouchableOpacity
            style={styles.pickerField}
            onPress={() => setPickerVisible(true)}
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
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Emitir Coleta</Text>
            )}
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
