import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, Alert, useWindowDimensions } from "react-native";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { Button } from "@/components/button";
import { createMaintenanceStyles } from "@/styles/maintenance.styles";
import { maintenanceService } from "@/services/maintenance";
import { vehiclesService } from "@/services/vehicles";
import { useMaintenanceTypes, listKeys } from "@/hooks/querys/useListData";
import rollback from "@/services/rollback";

interface FormData {
  vehicle_id: string;
  maintenance_type_id: string;
  cost: string;
  odometer: string;
  description: string;
}

export default function CreateMaintenanceScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createMaintenanceStyles(theme, isMobile);
  const queryClient = useQueryClient();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: types = [] } = useMaintenanceTypes();

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      vehicle_id: "",
      maintenance_type_id: "",
      cost: "",
      odometer: "",
      description: "",
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

  // Agrupa nome + categoria pra clareza no dropdown
  const typeOptions = useMemo(
    () =>
      types.map((t: any) => ({
        label: `${t.name} (${t.category})`,
        value: t.id,
      })),
    [types],
  );

  const onSubmit = async (data: FormData) => {
    if (!data.vehicle_id) return Alert.alert("Atenção", "Selecione o veículo.");
    if (!data.maintenance_type_id)
      return Alert.alert("Atenção", "Selecione o tipo de manutenção.");
    if (!data.cost || Number(data.cost) < 0)
      return Alert.alert("Atenção", "Informe um custo válido.");

    setSubmitting(true);
    try {
      await maintenanceService.create({
        vehicle_id: data.vehicle_id,
        maintenance_type_id: data.maintenance_type_id,
        cost: Number(data.cost),
        odometer: data.odometer ? Number(data.odometer) : null,
        description: data.description || null,
      });
      queryClient.invalidateQueries({ queryKey: listKeys.maintenances });
      rollback();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: isMobile ? 16 : 32, gap: 12 }}
    >
      <Text style={styles.title}>Nova manutenção</Text>

      <ControlledInput
        control={control}
        name="vehicle_id"
        label="Veículo"
        variant="dropDownList"
        options={vehicleOptions}
      />

      <ControlledInput
        control={control}
        name="maintenance_type_id"
        label="Tipo de manutenção"
        variant="dropDownList"
        options={typeOptions}
      />

      <ControlledInput
        control={control}
        name="cost"
        label="Custo (R$)"
        variant="numeric"
      />
      <ControlledInput
        control={control}
        name="odometer"
        label="Odômetro (opcional)"
        variant="numeric"
      />
      <ControlledInput
        control={control}
        name="description"
        label="Descrição (opcional)"
        multiline
      />

      <Button
        title={submitting ? "Salvando..." : "Salvar"}
        isLoading={submitting}
        onPress={handleSubmit(onSubmit)}
      />
    </ScrollView>
  );
}
