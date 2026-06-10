import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { FilterChips } from "@/components/filter-chips";
import { RestaurantListItem } from "@/components/restaurant-list-item";
import { SearchInput } from "@/components/search-input";
import { useAppData } from "@/context/app-data-context";
import { useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";

function filterRestaurants(restaurants: Restaurant[], search: string, filter: string) {
  const term = search.trim().toLowerCase();
  return restaurants.filter((restaurant) => {
    const matchesTerm =
      !term ||
      [restaurant.name, restaurant.segment, restaurant.neighborhood, restaurant.address, restaurant.promotion?.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);

    if (!matchesTerm) {
      return false;
    }
    if (filter === "Favoritos") {
      return restaurant.is_favorite;
    }
    if (filter === "Visitados") {
      return restaurant.is_visited;
    }
    if (filter === "Delivery") {
      return restaurant.accepts_delivery;
    }
    if (filter === "Pet friendly") {
      return restaurant.pet_friendly;
    }
    if (filter === "Area kids") {
      return restaurant.kids_area;
    }
    return true;
  });
}

export default function AllRestaurantsScreen() {
  const theme = useAppTheme();
  const { restaurants } = useAppData();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("Todos");
  const filtered = filterRestaurants(restaurants, search, filter);

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <ArrowLeft color={theme.text} size={22} strokeWidth={2.5} />
          </Pressable>
          <Text selectable style={{ color: theme.text, fontSize: 28, fontWeight: "900" }}>
            Todos
          </Text>
        </View>

        <SearchInput value={search} onChangeText={setSearch} />
        <FilterChips selected={filter} onSelect={setFilter} />

        <View style={{ gap: 2 }}>
          <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
            {filtered.length} restaurantes encontrados
          </Text>
          {filtered.map((restaurant) => (
            <RestaurantListItem key={restaurant.id} restaurant={restaurant} />
          ))}
        </View>
      </ScrollView>
    </AppBackground>
  );
}
