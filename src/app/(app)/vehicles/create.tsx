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
import { vehicleSchema } from "@/schemas/vehicleSchema";
import { useTheme } from "@/contexts/themeContext";
import { createVehicleStyles } from "@/styles/vehicles.styles";
import { api } from "@/services/api";
import { ControlledInput } from "@/components/controllerInput";
import { VehicleTypeSchema } from "@/schemas/enumSchema";
import rollback from "@/services/rollback";
import { useAuth } from "@/contexts/authContext";
import { DocumentUpload } from "@/components/documentUpload";

export default function CreateVehicleScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const styles = createVehicleStyles(theme, isMobile);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [crlvDocUrl, setCrlvDocUrl] = useState<string | null>(null);
  const [seguroDocUrl, setSeguroDocUrl] = useState<string | null>(null);
  const [tacografoDocUrl, setTacografoDocUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post("/vehicles", {
        ...data,
        crlv_doc_url: crlvDocUrl,
        seguro_doc_url: seguroDocUrl,
        tacografo_doc_url: tacografoDocUrl,
        created_by: user?.user.id,
      });
      Alert.alert("Sucesso", "Veículo cadastrado!");
      rollback();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions = VehicleTypeSchema.options.map((option) => ({
    label: option,
    value: option,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather name="chevron-left" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Veículo</Text>
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
            placeholder="Ex: ABC1D34"
            mask="AAA9A99"
            iconName={"filter"}
            errorMessage={errors.license_plate?.message as string}
          />
          <ControlledInput
            control={control}
            name="model"
            label="Modelo"
            iconName={"filter"}
            placeholder="Ex: FH 540"
            errorMessage={errors.model?.message as string}
          />
          <ControlledInput
            control={control}
            name="make"
            label="Marca"
            placeholder="Ex: Scania"
            iconName={"filter"}
            errorMessage={errors.make?.message as string}
          />
          <ControlledInput
            control={control}
            name="capacity_fuel"
            label="Capacidade de Combustível (L)"
            iconName="droplet"
            placeholder="Ex: 50"
            variant="numeric"
            errorMessage={errors.capacity_fuel?.message as string}
          />

          <ControlledInput
            control={control}
            name="year"
            label="Ano"
            iconName="calendar"
            placeholder="Ex: "
            variant="numeric"
            maxLength={4}
            errorMessage={errors.year?.message as string}
          />

          <ControlledInput
            control={control}
            name="type"
            label="Tipo"
            placeholder="Ex: Caminhão, Van"
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
            onUploaded={setCrlvDocUrl}
            theme={theme}
          />
          <DocumentUpload
            label="Apólice de Seguro (PDF ou imagem)"
            entity="vehicles"
            type="seguro"
            onUploaded={setSeguroDocUrl}
            theme={theme}
          />
          <DocumentUpload
            label="Tacógrafo (PDF ou imagem)"
            entity="vehicles"
            type="tacografo"
            onUploaded={setTacografoDocUrl}
            theme={theme}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color={theme.isDark ? theme.textSecondary : theme.text}
            />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
