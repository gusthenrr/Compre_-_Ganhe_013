import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/theme/colors";

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  const theme = useAppTheme();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text selectable style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={{ minHeight: 36, flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
            {actionLabel}
          </Text>
          <ChevronRight color={theme.muted} size={18} strokeWidth={2.6} />
        </Pressable>
      ) : null}
    </View>
  );
}
