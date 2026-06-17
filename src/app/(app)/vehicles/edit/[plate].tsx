import React, { useEffect, useState } from "react";
import {
  View,
  Text,
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
import { vehicleSchema, VehicleType } from "@/schemas/vehicleSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { VehicleTypeSchema } from "@/schemas/enumSchema";
import rollback from "@/services/rollback";

export default function EditVehicleScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createVehicleStyles(theme, isMobile);

  const { plate } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleType>();

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
        reset({
          ...res.data,
          year: String(res.data.year || ""),
          capacity_fuel: String(res.data.capacity_fuel || ""),
        });
        setLoading(false);
      }
    } catch (err) {
      Alert.alert("Erro", "Veículo não encontrado.");
    }
  };

  const onSubmit = async (data: VehicleType) => {
    setSubmitting(true);

    const normalizedData = {
      ...data,
      year: Number(data.year),
      capacity_fuel: Number(data.capacity_fuel),
    };

    try {
      await api.put(`/vehicles/${vehicle?.id}`, normalizedData);

      Alert.alert("Sucesso", "Veículo atualizado!");
      rollback();
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err.response?.data?.message || "Não foi possível atualizar o veículo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchVehicle(plate as string);
  }, [plate]);

  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={theme.primary}
      />
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather name="chevron-left" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Veículo</Text>
      </View>

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

      <ControlledInput
        control={control}
        name="is_active"
        label="Status Ativo (true/false)"
        iconName="check-circle"
        variant="switch"
        errorMessage={errors.is_active?.message as string}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
