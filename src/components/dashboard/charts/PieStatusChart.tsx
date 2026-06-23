import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { EChart } from "@/components/dashboard/EChart";
import type { Slice } from "@/services/dashboard";

interface Props {
  data: Slice[];
  centerValue?: string | number;
  centerLabel?: string;
  title?: string;
  height?: number;
}

export function PieStatusChart({
  data,
  centerValue,
  centerLabel,
  title = "Distribuição",
  height = 280,
}: Props) {
  const { theme } = useTheme();
  const muted = theme.isDark ? "#94a3b8" : "#64748b";
  const total = data.reduce((a, d) => a + d.value, 0);
  const displayCenter = centerValue ?? total;

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}",
      },
      legend: {
        bottom: 8,
        left: "center",
        orient: "horizontal",
        data: data.map((d) => d.label),
        textStyle: { fontSize: 10, color: muted },
      },
      series: [
        {
          name: title,
          type: "pie",
          radius: ["35%", "65%"],
          center: ["50%", "40%"],
          padAngle: 2,
          itemStyle: {
            borderRadius: 4,
            borderWidth: 0,
          },
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              borderRadius: 6,
            },
          },
          data:
            data.length > 0
              ? data.map((d) => ({
                  name: d.label,
                  value: d.value,
                  itemStyle: { color: d.color }
                }))
              : [{
                  name: "Sem dados",
                  value: 1,
                  itemStyle: { color: theme.isDark ? "#2d3748" : "#e2e8f0" }
                }],
        },
      ],
    }),
    [data, title, theme, muted],
  );

  return (
    <EChart option={option} height={height} title={title} />
  );
}
