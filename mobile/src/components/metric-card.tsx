import { Text, View } from "react-native";

import { useAppTheme } from "@/theme/colors";

type Props = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: 118,
        padding: 14,
        borderRadius: 18,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 6,
      }}
    >
      <Text selectable style={{ color: theme.muted, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      <Text selectable style={{ color: theme.text, fontSize: 20, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}
