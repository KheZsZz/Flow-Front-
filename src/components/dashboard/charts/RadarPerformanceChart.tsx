import React, { useMemo } from "react";
import { useTheme } from "@/contexts/themeContext";
import { EChart } from "@/components/dashboard/EChart";

export interface RadarDatum {
  name: string;
  values: number[];
  color?: string;
}

interface Props {
  indicators: { name: string; max: number }[];
  series: RadarDatum[];
  title?: string;
  height?: number;
}

const PALETTE = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

export function RadarPerformanceChart({
  indicators,
  series,
  title = "Performance radar",
  height = 300,
}: Props) {
  const { theme } = useTheme();
  const muted = theme.isDark ? "#94a3b8" : "#64748b";

  const option = useMemo(
    () => ({
      tooltip: { trigger: "item" },
      legend: {
        data: series.map((s) => s.name),
        bottom: 8,
        left: "center",
        textStyle: { color: muted, fontSize: 10 },
      },
      radar: {
        indicator: indicators,
        shape: "polygon",
        splitNumber: 3,
        radius: "70%",
        axisName: { color: muted, fontSize: 10 },
        axisLine: { lineStyle: { color: theme.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" } },
        splitLine: {
          lineStyle: {
            color: [
              theme.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              theme.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
              theme.isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
            ],
          },
        },
        splitArea: { show: false },
      },
      series: [
        {
          type: "radar",
          symbol: "circle",
          symbolSize: 4,
          data: series.map((s, i) => ({
            name: s.name,
            value: s.values,
            itemStyle: { color: s.color ?? PALETTE[i % PALETTE.length] },
            lineStyle: { color: s.color ?? PALETTE[i % PALETTE.length], width: 1.5 },
            areaStyle: {
              color: (s.color ?? PALETTE[i % PALETTE.length]) + "22",
              opacity: 0.5,
            },
          })),
        },
      ],
    }),
    [indicators, series, muted, theme],
  );

  return <EChart option={option} height={height} title={title} />;
}
