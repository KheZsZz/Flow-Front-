import React, { useMemo } from "react";
import { useTheme } from "@/contexts/themeContext";
import { EChart } from "@/components/dashboard/EChart";

interface Props {
  labels: string[];
  values: number[];
  title?: string;
  height?: number;
  formatValue?: (n: number) => string;
}

export function AreaPiecesChart({
  labels,
  values,
  title = "Tendência de receita",
  height = 280,
  formatValue,
}: Props) {
  const { theme } = useTheme();

  const avg = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const p = params[0];
          const val = formatValue ? formatValue(p.value) : p.value;
          return `${p.name}<br/>${val}`;
        },
      },
      visualMap: {
        show: false,
        type: "piecewise",
        dimension: 1,
        pieces: [
          { min: avg, color: "#34d399" },
          { max: avg, color: "#f87171" },
        ],
      },
      grid: { left: 50, right: 16, top: 24, bottom: 36 },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { fontSize: 11 },
        axisTick: { show: false },
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          fontSize: 10,
          formatter: formatValue ? (v: number) => formatValue(v) : undefined,
        },
        splitNumber: 4,
      },
      series: [
        {
          name: title,
          type: "line",
          data: values,
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.3 },
          markLine: {
            silent: true,
            lineStyle: {
              type: "dashed",
              color: theme.isDark ? "#60a5fa" : "#1a73e8",
            },
            data: [
              {
                type: "average",
                name: "Média",
                label: {
                  formatter: formatValue
                    ? (p: any) => `Média: ${formatValue(p.value)}`
                    : "Média: {c}",
                  color: theme.isDark ? "#60a5fa" : "#1a73e8",
                  fontSize: 10,
                },
              },
            ],
          },
        },
      ],
    }),
    [labels, values, avg, title, formatValue, theme],
  );

  return <EChart option={option} height={height} title={title} />;
}
