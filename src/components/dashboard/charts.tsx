import React from "react";
import { View, Text } from "react-native";
import Svg, {
  Circle,
  G,
  Rect,
  Line,
  Polyline,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "@/contexts/themeContext";
import type { Slice } from "@/services/dashboard";

/* ── Donut (SVG puro, sem Skia) ────────────────────────────────────────── */
export function DonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: Slice[];
  centerValue?: string | number;
  centerLabel?: string;
}) {
  const { theme } = useTheme();
  const muted = theme.isDark ? "#aaa" : "#666";
  const track = theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const size = 200;
  const thickness = 26;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((a, d) => a + d.value, 0);

  let offset = 0;

  return (
    <View style={{ alignItems: "center", gap: 16 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={track}
            strokeWidth={thickness}
            fill="none"
          />
          {total > 0 &&
            data.map((d, i) => {
              const len = (d.value / total) * C;
              const seg = (
                <Circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  stroke={d.color}
                  strokeWidth={thickness}
                  fill="none"
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return seg;
            })}
        </G>
        <SvgText
          x={cx}
          y={cy}
          fontSize="28"
          fontWeight="bold"
          fill={theme.text}
          textAnchor="middle"
        >
          {centerValue ?? total}
        </SvgText>
        {!!centerLabel && (
          <SvgText
            x={cx}
            y={cy + 18}
            fontSize="11"
            fill={muted}
            textAnchor="middle"
          >
            {centerLabel}
          </SvgText>
        )}
      </Svg>

      {/* Legenda */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {data.map((d, i) => (
          <View
            key={i}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                backgroundColor: d.color,
              }}
            />
            <Text style={{ color: theme.text, fontSize: 12 }}>
              {d.label} · {d.value}
            </Text>
          </View>
        ))}
        {!data.length && (
          <Text style={{ color: muted, fontSize: 13 }}>Sem dados</Text>
        )}
      </View>
    </View>
  );
}

/* ── "Nice" max para a escala do eixo Y ───────────────────────────────── */
function niceMax(m: number): number {
  if (m <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(m)));
  const n = m / pow;
  let nice = 10;
  if (n <= 1) nice = 1;
  else if (n <= 2) nice = 2;
  else if (n <= 5) nice = 5;
  return nice * pow;
}

/* ── Barras + linha de tendência (SVG puro) ───────────────────────────── */
export function BarLineChart({
  labels,
  bars,
  line,
  barLabel,
  lineLabel,
  barColor,
  lineColor,
}: {
  labels: string[];
  bars: number[];
  line: number[];
  barLabel: string;
  lineLabel: string;
  barColor?: string;
  lineColor?: string;
}) {
  const { theme } = useTheme();
  const muted = theme.isDark ? "#aaa" : "#666";
  const grid = theme.isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const bColor = barColor ?? (theme.isDark ? theme.link : theme.primary);
  const lColor = lineColor ?? "#34d399";

  const VBW = 320;
  const VBH = 200;
  const padL = 26;
  const padR = 10;
  const padT = 12;
  const padB = 26;
  const plotW = VBW - padL - padR;
  const plotH = VBH - padT - padB;

  const max = niceMax(Math.max(1, ...bars, ...line));
  const n = Math.max(1, labels.length);
  const slot = plotW / n;
  const barW = Math.min(18, slot * 0.5);
  const bottom = padT + plotH;

  const x = (i: number) => padL + slot * i + slot / 2;
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  const ticks = 4;
  const linePoints = line.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <View style={{ gap: 12 }}>
      <Svg
        width="100%"
        height={220}
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* grade + rótulos Y */}
        {Array.from({ length: ticks + 1 }).map((_, t) => {
          const val = (max / ticks) * t;
          const yy = y(val);
          return (
            <G key={`g-${t}`}>
              <Line
                x1={padL}
                y1={yy}
                x2={VBW - padR}
                y2={yy}
                stroke={grid}
                strokeWidth={0.5}
              />
              <SvgText
                x={padL - 4}
                y={yy + 3}
                fontSize="7"
                fill={muted}
                textAnchor="end"
              >
                {Math.round(val)}
              </SvgText>
            </G>
          );
        })}

        {/* barras */}
        {bars.map((v, i) => (
          <Rect
            key={`b-${i}`}
            x={x(i) - barW / 2}
            y={y(v)}
            width={barW}
            height={Math.max(0, bottom - y(v))}
            rx={2}
            fill={bColor}
          />
        ))}

        {/* linha de tendência */}
        {line.length > 1 && (
          <Polyline
            points={linePoints}
            fill="none"
            stroke={lColor}
            strokeWidth={2}
          />
        )}
        {line.map((v, i) => (
          <Circle key={`p-${i}`} cx={x(i)} cy={y(v)} r={2.5} fill={lColor} />
        ))}

        {/* rótulos X */}
        {labels.map((lab, i) => (
          <SvgText
            key={`x-${i}`}
            x={x(i)}
            y={VBH - 8}
            fontSize="7"
            fill={muted}
            textAnchor="middle"
          >
            {lab}
          </SvgText>
        ))}
      </Svg>

      {/* legenda */}
      <View style={{ flexDirection: "row", gap: 18, justifyContent: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              backgroundColor: bColor,
            }}
          />
          <Text style={{ color: theme.text, fontSize: 12 }}>{barLabel}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 14,
              height: 3,
              borderRadius: 2,
              backgroundColor: lColor,
            }}
          />
          <Text style={{ color: theme.text, fontSize: 12 }}>{lineLabel}</Text>
        </View>
      </View>
    </View>
  );
}
