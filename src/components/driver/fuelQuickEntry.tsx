import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { Button } from "@/components/button";
import { fuelService, FuelPayload } from "@/services/fuel";
import { vehiclesService } from "@/services/vehicles";
import { fuelQuickEntryStyles } from "@/styles/fuelQuickEntry.styles";
import Toast from "react-native-toast-message";

interface FormData {
  vehicle_id: string;
  gas_station_name: string;
  liters: string;
  total_price: string;
  current_odometer: string;
}

export function FuelQuickEntry() {
  const { theme } = useTheme();
  const styles = fuelQuickEntryStyles(theme);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      vehicle_id: "",
      gas_station_name: "",
      liters: "",
      total_price: "",
      current_odometer: "",
    },
  });

  useEffect(() => {
    vehiclesService
      .list()
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const vehicleOptions = vehicles
    .filter((v: any) => v.is_active)
    .map((v: any) => ({ label: v.license_plate, value: v.id }));

  const onSubmit = async (data: FormData) => {
    if (!data.vehicle_id) return Alert.alert("Atenção", "Selecione o veículo.");
    if (!data.gas_station_name.trim())
      return Alert.alert("Atenção", "Informe o posto.");
    if (!data.liters || !data.total_price || !data.current_odometer)
      return Alert.alert("Atenção", "Preencha litros, valor e odômetro.");

    setSubmitting(true);
    try {
      const payload: FuelPayload = {
        vehicle_id: data.vehicle_id,
        gas_station_name: data.gas_station_name,
        fuel_type: "Diesel S10",
        liters: Number(data.liters),
        total_price: Number(data.total_price),
        current_odometer: Number(data.current_odometer),
      };
      await fuelService.create(payload);
      Toast.show({ type: "success", text1: "Abastecimento lançado" });
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Lançar abastecimento</Text>
      <ControlledInput
        control={control}
        name="vehicle_id"
        label="Veículo"
        variant="dropDownList"
        options={vehicleOptions}
      />
      <ControlledInput
        control={control}
        name="gas_station_name"
        label="Posto"
      />
      <ControlledInput
        control={control}
        name="liters"
        label="Litros"
        variant="numeric"
      />
      <ControlledInput
        control={control}
        name="total_price"
        label="Valor total (R$)"
        variant="numeric"
      />
      <ControlledInput
        control={control}
        name="current_odometer"
        label="Odômetro atual"
        variant="numeric"
      />
      <Button
        title={submitting ? "Lançando..." : "Lançar"}
        isLoading={submitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
