import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import * as echarts from "echarts/core";
import { SVGRenderer, SvgChart } from "@wuba/react-native-echarts";
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkAreaComponent,
  RadarComponent,
} from "echarts/components";

echarts.use([
  SVGRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkAreaComponent,
  RadarComponent,
]);

export { echarts };

interface EChartProps {
  option: echarts.EChartsCoreOption;
  height?: number;
  title?: string;
}

function ChartInstance({
  option,
  width,
  height,
  bg,
}: {
  option: echarts.EChartsCoreOption;
  width: number;
  height: number;
  bg: string;
}) {
  const svgRef = useRef<any>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    if (!chartRef.current) {
      chartRef.current = echarts.init(svgRef.current, undefined, {
        renderer: "svg",
        width,
        height,
      });
    }
    chartRef.current.setOption(option, { notMerge: true });
  }, [option, width, height]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  return <SvgChart ref={svgRef} style={{ backgroundColor: bg }} />;
}

export function EChart({ option, height = 260, title }: EChartProps) {
  const { theme } = useTheme();
  const { width: winW, height: winH } = useWindowDimensions();
  const [fullscreen, setFullscreen] = useState(false);
  const accent = theme.isDark ? theme.link : theme.primary;
  const bg = theme.card;

  const containerW = Math.max(winW - 40, 260);
  const fsW = winW - 32;
  const fsH = winH - 120;

  const themedOption = applyTheme(option, theme);

  return (
    <View>
      {/* Inline chart */}
      <View style={[s.wrap, { backgroundColor: bg }]}>
        <ChartInstance
          option={themedOption}
          width={containerW}
          height={height}
          bg={bg}
        />
        <TouchableOpacity
          style={[s.expandBtn, { backgroundColor: accent + "22" }]}
          onPress={() => setFullscreen(true)}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Feather name="maximize-2" size={14} color={accent} />
        </TouchableOpacity>
      </View>

      {/* Fullscreen modal */}
      <Modal
        visible={fullscreen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setFullscreen(false)}
        statusBarTranslucent
      >
        <View style={[s.fsContainer, { backgroundColor: theme.background }]}>
          <View style={[s.fsHeader, { borderBottomColor: theme.borderColor }]}>
            {title ? (
              <Text style={[s.fsTitle, { color: theme.text }]}>{title}</Text>
            ) : (
              <View />
            )}
            <TouchableOpacity
              onPress={() => setFullscreen(false)}
              style={[s.closeBtn, { backgroundColor: accent + "22" }]}
            >
              <Feather name="x" size={20} color={accent} />
            </TouchableOpacity>
          </View>
          <View style={[s.fsBody, { backgroundColor: theme.card }]}>
            <ChartInstance
              option={themedOption}
              width={fsW}
              height={fsH}
              bg={theme.card}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function applyTheme(
  option: echarts.EChartsCoreOption,
  theme: any,
): echarts.EChartsCoreOption {
  const textColor = theme.isDark ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme.isDark ? "#94a3b8" : "#64748b";
  const splitLine = theme.isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(0,0,0,0.08)";
  const bg = theme.card;

  return {
    backgroundColor: bg,
    textStyle: { color: textColor, fontFamily: "System" },
    ...option,
    legend: option.legend
      ? {
          textStyle: { color: mutedColor },
          ...(option.legend as object),
        }
      : undefined,
    xAxis: option.xAxis
      ? applyAxis(option.xAxis, mutedColor, splitLine)
      : undefined,
    yAxis: option.yAxis
      ? applyAxis(option.yAxis, mutedColor, splitLine)
      : undefined,
    tooltip: option.tooltip
      ? {
          backgroundColor: theme.isDark ? "#1e293b" : "#ffffff",
          borderColor: theme.borderColor,
          textStyle: { color: textColor },
          ...(option.tooltip as object),
        }
      : undefined,
  };
}

function applyAxis(axis: any, color: string, splitLine: string): any {
  if (Array.isArray(axis)) return axis.map((a) => applyAxis(a, color, splitLine));
  return {
    ...axis,
    axisLabel: { color, ...(axis.axisLabel ?? {}) },
    axisLine: { lineStyle: { color }, ...(axis.axisLine ?? {}) },
    splitLine: { lineStyle: { color: splitLine }, ...(axis.splitLine ?? {}) },
  };
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  expandBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 8,
    padding: 6,
  },
  fsContainer: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 32,
  },
  fsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  fsTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  closeBtn: {
    borderRadius: 10,
    padding: 8,
  },
  fsBody: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});
