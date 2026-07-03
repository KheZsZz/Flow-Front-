import React, { useEffect, useState } from "react";
import { ScrollView, Text, Alert, useWindowDimensions } from "react-native";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { Button } from "@/components/button";
import { createFuelStyles } from "@/styles/fuel.styles";
import { fuelService } from "@/services/fuel";
import { vehiclesService } from "@/services/vehicles";
import { FuelTypeShema } from "@/services/schemas/enumSchemanumSchema";
import { listKeys } from "@/hooks/querys/useListData";
import rollback from "@/services/rollback";

interface FormData {
  vehicle_id: string;
  gas_station_name: string;
  fuel_type: string;
  liters: string;
  total_price: string;
  current_odometer: string;
}

const fuelTypeOptions = FuelTypeShema.map((f) => ({ label: f, value: f }));

export default function CreateFuelScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createFuelStyles(theme, isMobile);
  const queryClient = useQueryClient();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      vehicle_id: "",
      gas_station_name: "",
      fuel_type: fuelTypeOptions[0]?.value ?? "Diesel S10",
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
    .map((v: any) => ({
      label: `${v.license_plate} · ${v.make} ${v.model}`,
      value: v.id,
    }));

  const onSubmit = async (data: FormData) => {
    if (!data.vehicle_id) return Alert.alert("Atenção", "Selecione o veículo.");
    if (!data.gas_station_name.trim())
      return Alert.alert("Atenção", "Informe o posto.");
    if (!data.liters || Number(data.liters) <= 0)
      return Alert.alert("Atenção", "Informe os litros.");
    if (!data.total_price || Number(data.total_price) <= 0)
      return Alert.alert("Atenção", "Informe o valor total.");

    setSubmitting(true);
    try {
      await fuelService.create({
        vehicle_id: data.vehicle_id,
        gas_station_name: data.gas_station_name,
        fuel_type: data.fuel_type,
        liters: Number(data.liters),
        total_price: Number(data.total_price),
        current_odometer: Number(data.current_odometer || 0),
      });
      queryClient.invalidateQueries({ queryKey: listKeys.fuel });
      rollback();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: isMobile ? 16 : 32, gap: 12 }}
    >
      <Text style={styles.title}>Novo abastecimento</Text>

      <ControlledInput
        control={control}
        name="vehicle_id"
        label="Veículo"
        variant="dropDownList"
        options={vehicleOptions}
      />
      <ControlledInput
        control={control}
        name="fuel_type"
        label="Tipo de combustível"
        variant="dropDownList"
        options={fuelTypeOptions}
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
        title={submitting ? "Salvando..." : "Salvar"}
        isLoading={submitting}
        onPress={handleSubmit(onSubmit)}
      />
    </ScrollView>
  );
}
