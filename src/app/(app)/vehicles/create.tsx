import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema } from "@/schemas/vehicleSchema";
import { useTheme } from "@/contexts/themeContext";
import { createVehicleStyles } from "@/styles/vehicles.styles";
import { api } from "@/services/api";
import { ControlledInput } from "@/components/controllerInput";

export default function CreateVehicleScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const styles = createVehicleStyles(theme, isMobile);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      await api.post("/vehicles", data);
      Alert.alert("Sucesso", "Veículo cadastrado!");
      router.back();
    } catch (e) {
      Alert.alert("Erro", "Falha ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather
            name="arrow-left"
            size={24}
            color={theme.isDark ? theme.textSecondary : theme.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Veículo</Text>
      </View>
      <View style={styles.form}>
        <ControlledInput
          control={control}
          name="license_plate"
          label="Placa"
          iconName="credit-card"
          placeholder="ABC-1234"
          errorMessage={errors.license_plate?.message as string}
        />

        <ControlledInput
          control={control}
          name="model"
          label="Modelo"
          iconName="truck"
          placeholder="Ex: FH 540"
          errorMessage={errors.model?.message as string}
        />

        <ControlledInput
          control={control}
          name="make"
          label="Marca"
          iconName="tag"
          placeholder="Ex: Volvo"
          errorMessage={errors.make?.message as string}
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
    </SafeAreaView>
  );
}
