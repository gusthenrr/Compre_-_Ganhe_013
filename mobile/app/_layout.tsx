import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as React from "react";

import { AuthProvider } from "@/context/auth-context";
import { AppDataProvider } from "@/context/app-data-context";
import { useAppTheme } from "@/theme/colors";

export default function RootLayout() {
  const theme = useAppTheme();

  React.useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);

  return (
    <AuthProvider>
      <AppDataProvider>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="all" />
          <Stack.Screen name="restaurant/[id]" />
        </Stack>
      </AppDataProvider>
    </AuthProvider>
  );
}
