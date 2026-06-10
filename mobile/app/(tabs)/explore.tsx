import * as React from "react";
import { PanResponder, Pressable, ScrollView, Text, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { FilterChips } from "@/components/filter-chips";
import { MapPreview } from "@/components/map-preview";
import { RestaurantListItem } from "@/components/restaurant-list-item";
import { SearchInput } from "@/components/search-input";
import { useAppData } from "@/context/app-data-context";
import { useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";

function applySearchAndFilter(restaurants: Restaurant[], search: string, filter: string) {
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

export default function ExploreScreen() {
  const theme = useAppTheme();
  const { restaurants } = useAppData();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("Todos");
  const [mode, setMode] = React.useState<"Mapa" | "Lista">("Mapa");
  const [expanded, setExpanded] = React.useState(false);
  const filtered = applySearchAndFilter(restaurants, search, filter);
  const [selectedId, setSelectedId] = React.useState<number | undefined>(filtered[0]?.id);
  const listRestaurants = React.useMemo(() => {
    if (!selectedId) {
      return filtered;
    }
    return [...filtered].sort((a, b) => {
      if (a.id === selectedId) {
        return -1;
      }
      if (b.id === selectedId) {
        return 1;
      }
      return a.distance_meters - b.distance_meters;
    });
  }, [filtered, selectedId]);
  const sheetPanResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 18) {
          setExpanded(true);
        }
        if (gesture.dy < -18) {
          setExpanded(false);
        }
      },
    }),
  ).current;

  React.useEffect(() => {
    if (filtered.length && !filtered.some((restaurant) => restaurant.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 112 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar restaurantes, bairros..." />
          </View>
          <View
            style={{
              flexDirection: "row",
              borderRadius: 18,
              backgroundColor: theme.chip,
              padding: 3,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {(["Mapa", "Lista"] as const).map((item) => {
              const active = mode === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  style={{
                    minHeight: 36,
                    minWidth: 48,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: active ? theme.accent : "transparent",
                  }}
                >
                  <Text selectable style={{ color: active ? "#06111D" : theme.text, fontSize: 12, fontWeight: "900" }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FilterChips selected={filter} onSelect={setFilter} />
        </View>

        <View
          style={{
            minHeight: 28,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.border,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <Text selectable style={{ color: theme.text, fontSize: 13, fontWeight: "900" }}>
            Santos - SP
          </Text>
        </View>

        {mode === "Mapa" ? (
          <MapPreview restaurants={filtered} selectedId={selectedId} onSelect={setSelectedId} expanded={expanded} />
        ) : null}

        <View
          style={{
            marginTop: mode === "Mapa" ? -12 : 14,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 8,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            backgroundColor: theme.dark ? "#081018" : theme.background,
          }}
        >
          <Pressable
            onPress={() => setExpanded((value) => !value)}
            style={{ alignItems: "center", paddingTop: 4, paddingBottom: 14 }}
            {...sheetPanResponder.panHandlers}
          >
            <View
              style={{
                width: 54,
                height: 5,
                borderRadius: 999,
                backgroundColor: theme.dark ? "rgba(255,255,255,0.28)" : "rgba(16,24,40,0.22)",
              }}
            />
          </Pressable>

        <View style={{ gap: 2 }}>
          <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
            Exibindo {filtered.length} parceiros em Santos
          </Text>
          {listRestaurants.map((restaurant) => (
            <RestaurantListItem key={restaurant.id} restaurant={restaurant} />
          ))}
        </View>
        </View>
      </ScrollView>
    </AppBackground>
  );
}
