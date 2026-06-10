import { Map, Rows3 } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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

  React.useEffect(() => {
    if (filtered.length && !filtered.some((restaurant) => restaurant.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingBottom: 112, gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar restaurantes, bairros..." />
          </View>
          <View
            style={{
              flexDirection: "row",
              borderRadius: 18,
              backgroundColor: theme.chip,
              padding: 4,
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
                    minHeight: 42,
                    minWidth: 68,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 6,
                    backgroundColor: active ? theme.accent : "transparent",
                  }}
                >
                  {item === "Mapa" ? (
                    <Map color={active ? "#06111D" : theme.text} size={17} strokeWidth={2.4} />
                  ) : (
                    <Rows3 color={active ? "#06111D" : theme.text} size={17} strokeWidth={2.4} />
                  )}
                  <Text selectable style={{ color: active ? "#06111D" : theme.text, fontWeight: "900" }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FilterChips selected={filter} onSelect={setFilter} />

        <View
          style={{
            minHeight: 48,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text selectable style={{ color: theme.text, fontSize: 17, fontWeight: "900" }}>
            Santos - SP
          </Text>
        </View>

        {mode === "Mapa" ? (
          <View style={{ gap: 10 }}>
            <MapPreview restaurants={filtered} selectedId={selectedId} onSelect={setSelectedId} expanded={expanded} />
            <Pressable
              onPress={() => setExpanded((value) => !value)}
              style={{
                alignSelf: "center",
                minHeight: 38,
                borderRadius: 999,
                paddingHorizontal: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.surfaceStrong,
              }}
            >
              <Text selectable style={{ color: theme.text, fontWeight: "900" }}>
                {expanded ? "Reduzir mapa" : "Expandir mapa"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={{ gap: 2 }}>
          <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
            Exibindo {filtered.length} parceiros em Santos
          </Text>
          {filtered.map((restaurant) => (
            <RestaurantListItem key={restaurant.id} restaurant={restaurant} />
          ))}
        </View>
      </ScrollView>
    </AppBackground>
  );
}
