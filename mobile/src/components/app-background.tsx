import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { useAppTheme } from "@/theme/colors";

export function AppBackground({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();

  if (theme.dark) {
    return (
      <LinearGradient colors={theme.gradient as [string, string, string]} style={{ flex: 1 }}>
        {children}
      </LinearGradient>
    );
  }

  return <View style={{ flex: 1, backgroundColor: theme.background }}>{children}</View>;
}
