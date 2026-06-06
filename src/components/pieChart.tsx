import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Pie, PolarChart } from "victory-native";

interface PieProps {
  title: string;
  data: { label: string; value: number; color: string }[];
  textColor?: string;
}

export function InteractivePieChart({
  title,
  data,
  textColor = "#ffffff",
}: PieProps) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth > 600 ? 500 : screenWidth - 32;

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 16,
        borderRadius: 12,
        width: chartWidth,
        height: 320,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 16,
        }}
      >
        {title}
      </Text>

      <View
        style={{
          flex: 1,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <PolarChart
          data={data}
          labelKey="label"
          valueKey="value"
          colorKey="color"
        >
          <Pie.Chart>
            {({ jokes }) => (
              <Pie.Slice
                key={jokes.index}
                {...jokes}
                animate={{ type: "timing", duration: 400 }}
              />
            )}
          </Pie.Chart>
        </PolarChart>

        {/* Legendas Laterais Customizadas */}
        <View style={{ gap: 8, marginLeft: 10, justifyContent: "center" }}>
          {data.map((item, index) => (
            <View
              key={index}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: item.color,
                }}
              />
              <Text style={{ color: textColor, fontSize: 11 }}>
                {item.label}: {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
