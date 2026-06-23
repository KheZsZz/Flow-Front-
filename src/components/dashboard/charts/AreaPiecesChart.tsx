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

  const lineColor = "#34d399";
  const belowAvgColor = "#f87171";

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          if (!params || params.length === 0) return "";
          const p = params[0];
          const val = formatValue ? formatValue(p.value) : p.value;
          return `${p.name}<br/>${val}`;
        },
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
          symbolSize: 4,
          lineStyle: { width: 2, color: lineColor },
          itemStyle: { color: lineColor },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: lineColor + "44" },
                { offset: 1, color: lineColor + "00" },
              ],
            },
          },
          markLine: {
            silent: true,
            lineStyle: {
              type: "dashed",
              color: theme.isDark ? "#60a5fa" : "#1a73e8",
              width: 1,
            },
            label: {
              formatter: "Média",
              color: theme.isDark ? "#60a5fa" : "#1a73e8",
              fontSize: 9,
            },
            data: [{ type: "average", name: "Média" }],
          },
        },
      ],
    }),
    [labels, values, title, formatValue, theme, lineColor, belowAvgColor],
  );

  return <EChart option={option} height={height} title={title} />;
}
