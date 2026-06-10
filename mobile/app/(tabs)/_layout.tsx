import { Tabs } from "expo-router";
import { Compass, Home, UserRound } from "lucide-react-native";

import { useAppTheme } from "@/theme/colors";

export default function TabsLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.tabMuted,
        tabBarStyle: {
          backgroundColor: theme.navBackground,
          borderTopColor: theme.border,
          minHeight: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home color={color} size={24} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color }) => <Compass color={color} size={24} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Minha conta",
          tabBarIcon: ({ color }) => <UserRound color={color} size={24} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  );
}
