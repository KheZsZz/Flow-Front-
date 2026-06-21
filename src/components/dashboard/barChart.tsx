import React from "react";
import { View, Text, Dimensions } from "react-native";
import { CartesianChart, Bar, Tooltip } from "victory-native";
import { LinearGradient, vec } from "@shopify/react-native-skia";

interface BarProps {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
  textColor?: string;
}

export function InteractiveBarChart({
  title,
  data,
  color = "#3498db",
  textColor = "#ffffff",
}: BarProps) {
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
        yKeys={["value"]}
        domainPadding={{ x: 20, y: 10 }}
        axisOptions={{
          labelColor: textColor,
          lineColor: "rgba(255,255,255,0.1)",
        }}
      >
        {({ points, chartBounds }) => (
          <>
            <Bar
              points={points.value}
              chartBounds={chartBounds}
              animate={{ type: "timing", duration: 300 }}
              roundedCorners={{ topLeft: 6, topRight: 6 }}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 300)}
                colors={[color, `${color}40`]}
              />
            </Bar>

            {/* Balão de Informação ao passar o mouse / tocar */}
            <Tooltip
              chartBounds={chartBounds}
              x={points.value[0]?.x}
              y={points.value[0]?.y}
            >
              {({ x, y, value }) => (
                <View
                  style={{
                    position: "absolute",
                    left: x - 50,
                    top: y - 45,
                    backgroundColor: "#1c2833",
                    padding: 6,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: color,
                    width: 100,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {value?.toFixed(2)}
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
