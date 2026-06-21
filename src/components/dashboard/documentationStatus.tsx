import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { buildDocCounters } from "@/services/dashboard";

export function DocumentationStatus({ invoices }: { invoices: any[] }) {
  const { theme } = useTheme();
  const counters = buildDocCounters(invoices);
  const track = theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <View style={{ gap: 18 }}>
      {/* Barras de completude */}
      <View style={{ gap: 16 }}>
        {counters.map((c) => {
          const pct = c.total ? Math.round((c.ok / c.total) * 100) : 0;
          return (
            <View key={c.key} style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}
                >
                  {c.label}
                </Text>
                <Text
                  style={{
                    color: theme.isDark ? "#aaa" : "#666",
                    fontSize: 12,
                  }}
                >
                  {c.ok}/{c.total}{" "}
                  <Text style={{ color: c.color, fontWeight: "700" }}>
                    {pct}%
                  </Text>
                </Text>
              </View>
              <View
                style={{
                  height: 10,
                  borderRadius: 6,
                  backgroundColor: track,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 10,
                    borderRadius: 6,
                    width: `${pct}%`,
                    backgroundColor: c.color,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Pílulas de pendência */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {counters
          .filter((c) => c.missing > 0)
          .map((c) => (
            <View
              key={c.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: c.color + "1f",
                borderWidth: 1,
                borderColor: c.color + "55",
              }}
            >
              <Feather name="alert-triangle" size={13} color={c.color} />
              <Text style={{ color: c.color, fontSize: 12, fontWeight: "700" }}>
                {c.missingLabel}
              </Text>
            </View>
          ))}
        {counters.every((c) => c.missing === 0) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: "#34d39920",
              borderWidth: 1,
              borderColor: "#34d39955",
            }}
          >
            <Feather name="check-circle" size={13} color="#34d399" />
            <Text style={{ color: "#34d399", fontSize: 12, fontWeight: "700" }}>
              Documentação completa
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
