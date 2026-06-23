import React, { useMemo } from "react";
import { useTheme } from "@/contexts/themeContext";
import { EChart } from "@/components/dashboard/EChart";

interface Props {
  stages: { name: string; value: number; color?: string }[];
  title?: string;
  height?: number;
}

const DEFAULT_COLORS = ["#60a5fa", "#fbbf24", "#34d399", "#a78bfa", "#f87171"];

export function FunnelOrderChart({
  stages,
  title = "Funil de viagens",
  height = 280,
}: Props) {
  const { theme } = useTheme();
  const muted = theme.isDark ? "#94a3b8" : "#64748b";

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}",
      },
      legend: {
        data: stages.map((s) => s.name),
        bottom: 8,
        left: "center",
        textStyle: { color: muted, fontSize: 10 },
      },
      series: [
        {
          name: title,
          type: "funnel",
          left: "5%",
          right: "5%",
          top: 16,
          bottom: 48,
          sort: "descending",
          gap: 3,
          label: {
            show: true,
            position: "inside",
            formatter: (p: any) => `${p.name}\n${p.value}`,
            color: "#fff",
            fontSize: 11,
            fontWeight: "600",
          },
          labelLine: { show: false },
          itemStyle: { borderRadius: 2 },
          emphasis: {
            label: { fontSize: 12 },
            itemStyle: { opacity: 0.8 },
          },
          data: stages.map((s, i) => ({
            name: s.name,
            value: s.value,
            itemStyle: {
              color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
            },
          })),
        },
      ],
    }),
    [stages, title, muted],
  );

  return <EChart option={option} height={height} title={title} />;
}
