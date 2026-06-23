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
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        bottom: 0,
        left: "center",
        orient: "horizontal",
        data: data.map((d) => d.label),
      },
      graphic: [
        {
          type: "text",
          left: "center",
          top: "38%",
          style: {
            text: String(displayCenter),
            textAlign: "center",
            fill: theme.text,
            fontSize: 26,
            fontWeight: "bold",
          },
        },
        {
          type: "text",
          left: "center",
          top: "47%",
          style: {
            text: centerLabel ?? "",
            textAlign: "center",
            fill: muted,
            fontSize: 12,
          },
        },
      ],
      series: [
        {
          name: title,
          type: "pie",
          radius: ["42%", "68%"],
          center: ["50%", "45%"],
          padAngle: 3,
          itemStyle: {
            borderRadius: 6,
          },
          label: { show: false },
          emphasis: {
            label: { show: false },
            scale: true,
            scaleSize: 6,
          },
          data:
            data.length > 0
              ? data.map((d) => ({ name: d.label, value: d.value, itemStyle: { color: d.color } }))
              : [{ name: "Sem dados", value: 1, itemStyle: { color: theme.isDark ? "#2d3748" : "#e2e8f0" } }],
        },
      ],
    }),
    [data, displayCenter, centerLabel, title, theme, muted],
  );

  return (
    <EChart option={option} height={height} title={title} />
  );
}
