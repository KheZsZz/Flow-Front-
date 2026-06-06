import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { api } from "@/services/api";

import { InteractiveBarChart } from "@/components/barChart";
import { InteractivePieChart } from "@/components/pieChart";
import { InteractiveTrendChart } from "@/components/chartCombined";

export default function DashboardScreen() {
  const { theme } = useTheme();
  const [rawData, setRawData] = useState<any[]>([]);

  const [filtroVeiculo, setFiltroVeiculo] = useState<string>("TODOS");

  useEffect(() => {
    api
      .get("/dashboard/efficiency")
      .then((res) => setRawData(res.data))
      .catch(console.error);
  }, []);

  const dadosFiltrados = rawData.filter((item) => {
    if (filtroVeiculo === "TODOS") return true;
    return item.vehicle_id.startsWith(filtroVeiculo);
  });

  const barChartData = dadosFiltrados.map((m) => ({
    label: `V. ${m.vehicle_id.substring(0, 4)}`,
    value: m.total_price,
  }));

  const colors = ["#2ecc71", "#34495e", "#e74c3c", "#9b59b6"];
  const pieChartData = dadosFiltrados.map((m, i) => ({
    label: `V. ${m.vehicle_id.substring(0, 3)}`,
    value: m.liters,
    color: colors[i % colors.length],
  }));

  const trendChartData = dadosFiltrados.map((m, i) => {
    const kmPerLiter = m.kms_driven < 0 ? 0 : m.km_per_liter;
    return {
      label: `V.${m.vehicle_id.substring(0, 3)}`,
      atual: kmPerLiter,
      tendencia: 14.2, // Meta ou média estática da frota para referência de tendência
    };
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* BARRA DE FILTROS (UI INTERATIVA) */}
      <Text
        style={{
          color: "#fff",
          paddingHorizontal: 16,
          marginTop: 16,
          fontWeight: "bold",
        }}
      >
        Filtrar Unidade:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      >
        <Pressable
          onPress={() => setFiltroVeiculo("TODOS")}
          style={{
            padding: 10,
            backgroundColor: filtroVeiculo === "TODOS" ? "#3498db" : "#2c3e50",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff" }}>Frota Completa</Text>
        </Pressable>
        {rawData.map((m, index) => {
          const idCurto = m.vehicle_id.substring(0, 4);
          return (
            <Pressable
              key={index}
              onPress={() => setFiltroVeiculo(idCurto)}
              style={{
                padding: 10,
                backgroundColor:
                  filtroVeiculo === idCurto ? "#3498db" : "#2c3e50",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>Veículo {idCurto}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* RENDERIZAÇÃO DOS GRÁFICOS DINÂMICOS */}
      <View style={{ gap: 24, alignItems: "center", paddingBottom: 40 }}>
        {/*<InteractiveBarChart
          title="Gasto Financeiro Atualizado"
          data={barChartData}
          color="#3498db"
        />
        <InteractivePieChart
          title="Consumo Volumétrico (Liters)"
          data={pieChartData}
        />
        <InteractiveTrendChart
          title="Eficiência vs Meta de Tendência"
          data={trendChartData}
        />*/}
      </View>
    </ScrollView>
  );
}
