import * as React from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/theme/colors";

type Props = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
};

export function MetricCard({ label, value, icon, color }: Props) {
  const theme = useAppTheme();
  const accent = color ?? theme.accent;

  return (
    <View
      style={{
        flex: 1,
        minWidth: 118,
        padding: 14,
        borderRadius: 18,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.dark ? "rgba(255,255,255,0.14)" : "#DDE5F2",
        gap: 6,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text selectable style={{ flex: 1, color: theme.muted, fontSize: 12, fontWeight: "800" }} numberOfLines={1}>
          {label}
        </Text>
        {icon ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.dark ? `${accent}24` : `${accent}18`,
            }}
          >
            {icon}
          </View>
        ) : null}
      </View>
      <Text selectable style={{ color: theme.text, fontSize: 20, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}
