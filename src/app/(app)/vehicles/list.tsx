import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { createVehicleListStyles } from "@/styles/vehicleList.styles";
import { api } from "@/services/api";
import { VehicleType } from "@/schemas/vehicleSchema";
import { Loadding } from "@/components/loadding";

export default function VehiclesScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width <= 820;
  const styles = createVehicleListStyles(theme, isMobile);
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    const { data } = await api.get("/vehicles");
    setVehicles(data);
    setLoading(false);
  };

  const toggleStatus = async (vehicle: VehicleType) => {
    console.log("Iniciando patch para ID:", vehicle.id);

    try {
      const payload = { is_active: !vehicle.is_active };
      console.log("Payload enviado:", payload);

      const response = await api.patch(
        `/vehicles/${vehicle.id}/status`,
        payload,
      );

      console.log("Sucesso! Status atualizado:", response.data);
      fetchVehicles(); // Recarrega a lista
    } catch (error: any) {}
  };

  const handleEdit = async (vehicle: VehicleType) => {
    router.push(`/vehicles/edit/${vehicle.license_plate}`);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading)
    return (
      <Loadding color={theme.isDark ? theme.link : theme.text} size={50} />
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Veículos Ativos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/vehicles/create")}
        >
          <Feather name="plus" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      {vehicles.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum veículo encontrado.</Text>
      ) : (
        <View style={styles.gridContainer}>
          {vehicles.map((item) => (
            <View key={item.id} style={styles.card}>
              <View
                style={[
                  styles.imagePlaceholder,
                  { borderBottomColor: item.is_active ? "#79a5ed" : "#ef4444" },
                ]}
              >
                <Feather name="truck" size={50} color="#666" />
              </View>

              <View
                style={[
                  styles.titleBar,
                  { backgroundColor: item.is_active ? "#79a5ed" : "#ef4444" },
                ]}
              >
                <Text style={styles.titleText}>{item.model.toUpperCase()}</Text>
              </View>

              <View style={styles.body}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Placa: {item.license_plate}</Text>
                  <TouchableOpacity
                    style={
                      item.is_active
                        ? [styles.toggleBtn, styles.deleteBtn]
                        : [styles.toggleBtn, styles.baixarBtn]
                    }
                    onPress={() => toggleStatus(item)}
                  >
                    <Text
                      style={
                        item.is_active ? styles.deleteText : styles.baixarText
                      }
                    >
                      {item.is_active ? "Desativar" : "Ativar"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Status: {item.is_active ? "Ativo" : "Inativo"}
                  </Text>

                  <TouchableOpacity
                    style={[styles.editBtn, styles.toggleBtn]}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.editText}>
                      Alterar <Feather name="edit-2" size={10} />
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Modelo: {item.model} | Ano: {item.year}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
