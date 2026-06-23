import React, { useMemo } from "react";
import { useTheme } from "@/contexts/themeContext";
import { EChart } from "@/components/dashboard/EChart";

interface Props {
  value: number;
  label?: string;
  title?: string;
  height?: number;
}

export function GaugeChart({
  value,
  label = "%",
  title = "Indicador",
  height = 220,
}: Props) {
  const { theme } = useTheme();
  const muted = theme.isDark ? "#94a3b8" : "#64748b";
  const accent = theme.isDark ? theme.link : theme.primary;

  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  const color =
    clampedValue >= 80
      ? "#34d399"
      : clampedValue >= 50
        ? "#fbbf24"
        : "#f87171";

  const option = useMemo(
    () => ({
      series: [
        {
          type: "gauge",
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          radius: "85%",
          center: ["50%", "60%"],
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 16,
              color: [
                [clampedValue / 100, color],
                [1, theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"],
              ],
            },
          },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            formatter: `{value}${label}`,
            color: theme.text,
            fontSize: 22,
            fontWeight: "bold",
            offsetCenter: [0, "-10%"],
          },
          title: {
            offsetCenter: [0, "15%"],
            fontSize: 12,
            color: muted,
          },
          data: [{ value: clampedValue, name: title }],
        },
      ],
    }),
    [clampedValue, color, label, title, theme, muted],
  );

  return <EChart option={option} height={height} title={title} />;
}
