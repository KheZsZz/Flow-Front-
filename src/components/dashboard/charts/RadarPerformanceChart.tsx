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
        bottom: 0,
        textStyle: { color: muted },
      },
      radar: {
        indicator: indicators,
        shape: "polygon",
        splitNumber: 4,
        axisName: { color: muted, fontSize: 11 },
        splitLine: {
          lineStyle: {
            color: theme.isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.08)",
          },
        },
        splitArea: { show: false },
      },
      series: [
        {
          type: "radar",
          data: series.map((s, i) => ({
            name: s.name,
            value: s.values,
            itemStyle: { color: s.color ?? PALETTE[i % PALETTE.length] },
            lineStyle: { color: s.color ?? PALETTE[i % PALETTE.length], width: 2 },
            areaStyle: {
              color: (s.color ?? PALETTE[i % PALETTE.length]) + "33",
            },
          })),
        },
      ],
    }),
    [indicators, series, muted, theme],
  );

  return <EChart option={option} height={height} title={title} />;
}
