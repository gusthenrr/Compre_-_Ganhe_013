import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { AuthProvider } from "@/context/auth-context";
import { AppDataProvider } from "@/context/app-data-context";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <AuthProvider>
      <AppDataProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: scheme === "dark" ? "#07111E" : "#F6F8FC" },
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
