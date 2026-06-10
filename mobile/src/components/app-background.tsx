import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/colors";

export function AppBackground({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();

  if (theme.dark) {
    return (
      <LinearGradient colors={theme.gradient as [string, string, string]} style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
