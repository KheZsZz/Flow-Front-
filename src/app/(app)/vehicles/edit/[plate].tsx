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
import { useTheme } from "@/contexts/themeContext";
import { createVehicleStyles } from "@/styles/vehicles.styles";
import { api } from "@/services/api";
import { ControlledInput } from "@/components/controllerInput";
import {
  vehicleSchema,
  VehicleType,
} from "@/services/schemas/vehicleSchemacleSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { VehicleTypeSchema } from "@/services/schemas/enumSchemanumSchema";
import rollback from "@/services/rollback";
import { Loadding } from "@/components/loadding";
import { DocumentUpload } from "@/components/documentUpload";

export default function EditVehicleScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createVehicleStyles(theme, isMobile);

  const { plate } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleType>();
  const [crlvDocUrl, setCrlvDocUrl] = useState<string | null>(null);
  const [seguroDocUrl, setSeguroDocUrl] = useState<string | null>(null);
  const [tacografoDocUrl, setTacografoDocUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      license_plate: "",
      model: "",
      make: "",
      year: "",
      capacity_fuel: "",
      type: "Truck",
      is_active: false,
      crlv_validade: null,
      seguro_validade: null,
      antt_validade: null,
      tacografo_validade: null,
    },
  });

  const vehicleOptions = VehicleTypeSchema.options.map((option) => ({
    label: option,
    value: option,
  }));

  const fetchVehicle = async (plate: string) => {
    try {
      const res = await api.get(`/vehicles/plate/${plate}`);
      if (res.data) {
        setVehicle(res.data);
        setCrlvDocUrl(res.data.crlv_doc_url ?? null);
        setSeguroDocUrl(res.data.seguro_doc_url ?? null);
        setTacografoDocUrl(res.data.tacografo_doc_url ?? null);
        reset({
          ...res.data,
          year: String(res.data.year || ""),
          capacity_fuel: String(res.data.capacity_fuel || ""),
        });
        setLoading(false);
      }
    } catch (err) {}
  };

  const onSubmit = async (data: VehicleType) => {
    setSubmitting(true);

    const normalizedData = {
      ...data,
      year: Number(data.year),
      capacity_fuel: Number(data.capacity_fuel),
    };

    try {
      await api.put(`/vehicles/${vehicle?.id}`, {
        ...normalizedData,
        crlv_doc_url: crlvDocUrl,
        seguro_doc_url: seguroDocUrl,
        tacografo_doc_url: tacografoDocUrl,
      });

      Alert.alert("Sucesso", "Veículo atualizado!");
      rollback();
    } catch (err: any) {
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchVehicle(plate as string);
  }, [plate]);

  if (loading)
    return <Loadding color={theme.isDark ? theme.link : theme.primary} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather name="chevron-left" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Veículo</Text>
      </View>

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <ControlledInput
            control={control}
            name="license_plate"
            label="Placa"
            iconName={"filter"}
            errorMessage={errors.license_plate?.message as string}
          />
          <ControlledInput
            control={control}
            name="model"
            label="Modelo"
            iconName={"filter"}
            errorMessage={errors.model?.message as string}
          />
          <ControlledInput
            control={control}
            name="make"
            label="Marca"
            iconName={"filter"}
            errorMessage={errors.make?.message as string}
          />
          <ControlledInput
            control={control}
            name="capacity_fuel"
            label="Capacidade de Combustível (L)"
            iconName="droplet"
            variant="numeric"
            errorMessage={errors.capacity_fuel?.message as string}
          />

          <ControlledInput
            control={control}
            name="year"
            label="Ano"
            iconName="calendar"
            variant="numeric"
            maxLength={4}
            errorMessage={errors.year?.message as string}
          />

          <ControlledInput
            control={control}
            name="type"
            label="Tipo (Ex: Caminhão, Van)"
            iconName="truck"
            variant="select"
            options={vehicleOptions}
            errorMessage={errors.type?.message as string}
          />

          {/* ─── Documentos ─────────────────────────────────────── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Documentos</Text>
          <Text style={styles.sectionHint}>
            Datas opcionais — usadas para alertar sobre vencimentos próximos.
          </Text>

          <ControlledInput
            control={control}
            name="crlv_validade"
            label="CRLV / Licenciamento"
            variant="date"
            iconName="calendar"
            errorMessage={errors.crlv_validade?.message as string}
          />
          <ControlledInput
            control={control}
            name="seguro_validade"
            label="Seguro"
            variant="date"
            iconName="calendar"
            errorMessage={errors.seguro_validade?.message as string}
          />
          <ControlledInput
            control={control}
            name="antt_validade"
            label="ANTT / RNTRC"
            variant="date"
            iconName="calendar"
            errorMessage={errors.antt_validade?.message as string}
          />
          <ControlledInput
            control={control}
            name="tacografo_validade"
            label="Tacógrafo"
            variant="date"
            iconName="calendar"
            errorMessage={errors.tacografo_validade?.message as string}
          />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Arquivos</Text>
          <DocumentUpload
            label="CRLV (PDF ou imagem)"
            entity="vehicles"
            type="crlv"
            currentUrl={crlvDocUrl}
            onUploaded={setCrlvDocUrl}
            theme={theme}
          />
          <DocumentUpload
            label="Apólice de Seguro (PDF ou imagem)"
            entity="vehicles"
            type="seguro"
            currentUrl={seguroDocUrl}
            onUploaded={setSeguroDocUrl}
            theme={theme}
          />
          <DocumentUpload
            label="Tacógrafo (PDF ou imagem)"
            entity="vehicles"
            type="tacografo"
            currentUrl={tacografoDocUrl}
            onUploaded={setTacografoDocUrl}
            theme={theme}
          />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Status</Text>
          <ControlledInput
            control={control}
            name="is_active"
            label="Status Ativo"
            iconName="check-circle"
            variant="switch"
            errorMessage={errors.is_active?.message as string}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
