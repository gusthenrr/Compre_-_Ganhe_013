import { router } from "expo-router";
import { Banknote, Flame, UserRound } from "lucide-react-native";
import * as React from "react";
import { ScrollView, Text, View } from "react-native";

import { AppBackground } from "@/components/app-background";
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#031A3B",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <UserRound color="#FFFFFF" size={17} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1, gap: 1, minWidth: 0 }}>
              <Text selectable style={{ color: theme.muted, fontSize: 13, fontWeight: "700" }}>
                Ola,
              </Text>
              <Text selectable numberOfLines={1} style={{ color: theme.text, fontSize: 20, fontWeight: "900" }}>
                {user?.name ?? "Gustavo"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <HeaderMetric
              label="Visitados"
              value={`${user?.visited_count ?? 0}`}
              icon={<Flame color={theme.accent} size={15} strokeWidth={2.6} />}
            />
            <HeaderMetric
              label="Economizou"
              value={formatMoney(user?.total_saved ?? 0)}
              icon={<Banknote color={theme.accent} size={15} strokeWidth={2.6} />}
            />
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

function HeaderMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const theme = useAppTheme();
  const wide = label === "Economizou";

  return (
    <View
      style={{
        width: wide ? 102 : 72,
        minHeight: 36,
        borderRadius: 14,
        paddingHorizontal: 7,
        paddingVertical: 5,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
      }}
    >
      {icon}
      <View style={{ flex: 1, gap: 0, minWidth: 0 }}>
        <Text selectable numberOfLines={1} style={{ color: theme.muted, fontSize: 8, fontWeight: "800" }}>
          {label}
        </Text>
        <Text selectable numberOfLines={1} style={{ color: theme.text, fontSize: wide ? 12 : 13, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
