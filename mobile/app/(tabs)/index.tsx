import { router } from "expo-router";
import { UserRound } from "lucide-react-native";
import * as React from "react";
import { ScrollView, Text, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { MetricCard } from "@/components/metric-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { RestaurantListItem } from "@/components/restaurant-list-item";
import { SearchInput } from "@/components/search-input";
import { SectionHeader } from "@/components/section-header";
import { useAppData } from "@/context/app-data-context";
import { useAuth } from "@/context/auth-context";
import { useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";
import { formatMoney } from "@/utils/format";

function matchesSearch(restaurant: Restaurant, search: string) {
  const term = search.trim().toLowerCase();
  if (!term) {
    return true;
  }
  return [
    restaurant.name,
    restaurant.segment,
    restaurant.neighborhood,
    restaurant.promotion?.title ?? "",
    restaurant.promotion?.description ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const { user } = useAuth();
  const { restaurants } = useAppData();
  const [search, setSearch] = React.useState("");

  const filtered = restaurants.filter((restaurant) => matchesSearch(restaurant, search));
  const nearby = filtered.slice(0, 6);
  const favorites = restaurants.filter((restaurant) => restaurant.is_favorite);
  const allPreview = filtered.slice(0, 4);

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingBottom: 112, gap: 24 }}>
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.primary,
              }}
            >
              <UserRound color="#FFFFFF" size={25} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text selectable style={{ color: theme.muted, fontWeight: "700" }}>
                Ola,
              </Text>
              <Text selectable numberOfLines={1} style={{ color: theme.text, fontSize: 26, fontWeight: "900" }}>
                {user?.name ?? "Gustavo"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <MetricCard label="Visitados" value={`${user?.visited_count ?? 0}`} />
            <MetricCard label="Economizou" value={formatMoney(user?.total_saved ?? 0)} />
          </View>
        </View>

        <SearchInput value={search} onChangeText={setSearch} />

        <View style={{ gap: 12 }}>
          <SectionHeader title="Mais proximos de mim" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {nearby.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: 10 }}>
          <SectionHeader title="Meus favoritos" />
          {favorites.length ? (
            favorites.slice(0, 3).map((restaurant) => <RestaurantListItem key={restaurant.id} restaurant={restaurant} compact />)
          ) : (
            <View style={{ padding: 18, borderRadius: 18, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
              <Text selectable style={{ color: theme.text, fontWeight: "800" }}>
                Voce ainda nao favoritou nenhum restaurante.
              </Text>
              <Text selectable style={{ color: theme.muted, marginTop: 4 }}>
                Toque no coracao dos lugares que deseja visitar depois.
              </Text>
            </View>
          )}
        </View>

        <View style={{ gap: 8 }}>
          <SectionHeader title="Todos" actionLabel="Ver todos" onAction={() => router.push("/all")} />
          {allPreview.map((restaurant) => (
            <RestaurantListItem key={restaurant.id} restaurant={restaurant} compact />
          ))}
        </View>
      </ScrollView>
    </AppBackground>
  );
}
