import React, { useMemo } from "react";
import { useTheme } from "@/contexts/themeContext";
import { EChart } from "@/components/dashboard/EChart";

interface Props {
  labels: string[];
  bars: number[];
  line: number[];
  barLabel: string;
  lineLabel: string;
  barColor?: string;
  lineColor?: string;
  title?: string;
  height?: number;
}

export function DynamicBarChart({
  labels,
  bars,
  line,
  barLabel,
  lineLabel,
  barColor,
  lineColor,
  title = "Volume",
  height = 260,
}: Props) {
  const { theme } = useTheme();
  const accent = theme.isDark ? theme.link : theme.primary;
  const bColor = barColor ?? accent;
  const lColor = lineColor ?? "#34d399";

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      legend: {
        data: [barLabel, lineLabel],
        top: 0,
      },
      grid: {
        left: 40,
        right: 16,
        top: 40,
        bottom: 36,
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        splitNumber: 4,
        axisLabel: { fontSize: 10 },
      },
      series: [
        {
          name: barLabel,
          type: "bar",
          data: bars,
          itemStyle: { color: bColor, borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 32,
          yAxisIndex: 0,
        },
        {
          name: lineLabel,
          type: "line",
          data: line,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: lColor, width: 2 },
          itemStyle: { color: lColor },
          yAxisIndex: 0,
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: lColor + "44" },
                { offset: 1, color: lColor + "00" },
              ],
            },
          },
        },
      ],
    }),
    [labels, bars, line, barLabel, lineLabel, bColor, lColor],
  );

  return <EChart option={option} height={height} title={title} />;
}
