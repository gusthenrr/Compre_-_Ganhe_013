import { Heart } from "lucide-react-native";
import { Pressable } from "react-native";

import { useAppTheme } from "@/theme/colors";

type Props = {
  active: boolean;
  onPress: () => void;
  size?: number;
};

export function FavoriteButton({ active, onPress, size = 22 }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? "rgba(53,228,129,0.18)" : theme.surfaceStrong,
        borderWidth: 1,
        borderColor: active ? theme.accent : theme.border,
      }}
    >
      <Heart
        color={active ? theme.accent : theme.text}
        fill={active ? theme.accent : "transparent"}
        size={size}
        strokeWidth={2.4}
      />
    </Pressable>
  );
}
