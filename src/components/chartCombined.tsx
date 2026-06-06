import React from "react";
import { View, Text, Dimensions } from "react-native";
import { CartesianChart, Line, Tooltip } from "victory-native";

interface TrendProps {
  title: string;
  data: { label: string; atual: number; tendencia: number }[];
  textColor?: string;
}

export function InteractiveTrendChart({
  title,
  data,
  textColor = "#ffffff",
}: TrendProps) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth > 600 ? 500 : screenWidth - 32;

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 16,
        borderRadius: 12,
        width: chartWidth,
        height: 300,
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      <CartesianChart
        data={data}
        xKey="label"
        yKeys={["atual", "tendencia"]}
        axisOptions={{
          labelColor: textColor,
          lineColor: "rgba(255,255,255,0.1)",
        }}
      >
        {({ points, chartBounds }) => (
          <>
            {/* Linha Principal de Dados (Azul) */}
            <Line
              points={points.atual}
              color="#3498db"
              strokeWidth={3}
              curve="catmullRom"
              animate={{ type: "timing", duration: 300 }}
            />

            {/* Linha de Tendência Proporcional (Vermelho/Laranja) */}
            <Line
              points={points.tendencia}
              color="#e67e22"
              strokeWidth={2}
              curve="linear"
              strokeDasharray={[4, 4]} // Deixa a linha tracejada para destacar
              animate={{ type: "timing", duration: 300 }}
            />

            {/* Tooltip Dinâmico ao passar o Mouse */}
            <Tooltip chartBounds={chartBounds}>
              {({ x, y, value }) => (
                <View
                  style={{
                    position: "absolute",
                    left: x - 60,
                    top: y - 60,
                    backgroundColor: "#1c2833",
                    padding: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#3498db",
                    width: 120,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11 }}>
                    Atual: {value?.atual?.toFixed(1)}
                  </Text>
                  <Text
                    style={{
                      color: "#e67e22",
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  >
                    Tend.: {value?.tendencia?.toFixed(1)}
                  </Text>
                </View>
              )}
            </Tooltip>
          </>
        )}
      </CartesianChart>
    </View>
  );
}
