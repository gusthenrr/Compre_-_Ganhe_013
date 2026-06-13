import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { CheckCircle2, LocateFixed, MapPin } from "lucide-react-native";
import * as React from "react";
import { Animated, PanResponder, Pressable, ScrollView, Text, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { FilterChips } from "@/components/filter-chips";
import { MapPreview } from "@/components/map-preview";
import { RestaurantListItem } from "@/components/restaurant-list-item";
import { SearchInput } from "@/components/search-input";
import { useAppData } from "@/context/app-data-context";
import { useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";
import { formatDistance, formatServiceMode } from "@/utils/format";

type PanelState = "map" | "split" | "list";
type PinnedSource = "nearest" | "map";

const SHEET_MIN_VISIBLE_HEIGHT = 118;
const SHEET_SPLIT_RATIO = 0.52;
const CITY_BAR_HEIGHT = 32;

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSheetSnapPoints(stageHeight: number): Record<PanelState, number> {
  if (stageHeight <= 0) {
    return { list: CITY_BAR_HEIGHT, split: CITY_BAR_HEIGHT, map: CITY_BAR_HEIGHT };
  }

  const map = Math.max(0, stageHeight - SHEET_MIN_VISIBLE_HEIGHT);
  const splitBase = Math.round(stageHeight * SHEET_SPLIT_RATIO);
  const split = clamp(splitBase, Math.min(260, map), Math.max(0, map - 150));

  return { list: CITY_BAR_HEIGHT, split, map };
}

function nearestPanelState(value: number, snapPoints: Record<PanelState, number>): PanelState {
  const entries = Object.entries(snapPoints) as [PanelState, number][];
  return entries.reduce((nearest, item) => {
    return Math.abs(item[1] - value) < Math.abs(nearest[1] - value) ? item : nearest;
  })[0];
}

export default function ExploreScreen() {
  const theme = useAppTheme();
  const { restaurants, hasUserLocation, locationLoading, requestUserLocation } = useAppData();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("Todos");
  const [mode, setMode] = React.useState<"Mapa" | "Lista">("Mapa");
  const [panelState, setPanelState] = React.useState<PanelState>("split");
  const [mapAnimationKey, setMapAnimationKey] = React.useState(0);
  const [stageHeight, setStageHeight] = React.useState(0);
  const filtered = applySearchAndFilter(restaurants, search, filter);
  const [selectedId, setSelectedId] = React.useState<number | undefined>(filtered[0]?.id);
  const [pinnedMapId, setPinnedMapId] = React.useState<number | undefined>();
  const [pinnedSource, setPinnedSource] = React.useState<PinnedSource>("nearest");
  const closestRestaurant = React.useMemo(() => {
    if (!filtered.length) {
      return undefined;
    }
    return [...filtered].sort((a, b) => {
      return (a.distance_meters ?? Number.MAX_SAFE_INTEGER) - (b.distance_meters ?? Number.MAX_SAFE_INTEGER);
    })[0];
  }, [filtered]);
  const pinnedRestaurantId = pinnedMapId ?? closestRestaurant?.id ?? selectedId;
  const selectedRestaurant = React.useMemo(
    () => filtered.find((restaurant) => restaurant.id === pinnedRestaurantId) ?? filtered[0],
    [filtered, pinnedRestaurantId],
  );
  const showPinnedRestaurant = Boolean(selectedRestaurant);
  const listRestaurants = React.useMemo(() => {
    if (!pinnedRestaurantId) {
      return filtered;
    }
    return [...filtered].sort((a, b) => {
      if (a.id === pinnedRestaurantId) {
        return -1;
      }
      if (b.id === pinnedRestaurantId) {
        return 1;
      }
      return (a.distance_meters ?? Number.MAX_SAFE_INTEGER) - (b.distance_meters ?? Number.MAX_SAFE_INTEGER);
    });
  }, [filtered, pinnedRestaurantId]);
  const partnerRestaurants = selectedRestaurant && showPinnedRestaurant
    ? listRestaurants.filter((restaurant) => restaurant.id !== selectedRestaurant.id)
    : listRestaurants;
  const sheetY = React.useRef(new Animated.Value(0)).current;
  const sheetYRef = React.useRef(0);
  const sheetDragStartYRef = React.useRef(0);
  const sheetPositionReadyRef = React.useRef(false);
  const panelStateRef = React.useRef<PanelState>("split");
  const restaurantListRef = React.useRef<ScrollView>(null);
  const sheetSnapPoints = React.useMemo(() => getSheetSnapPoints(stageHeight), [stageHeight]);

  const snapToPanel = React.useCallback((nextState: PanelState) => {
    panelStateRef.current = nextState;
    if (nextState === "list") {
      setMode("Lista");
    } else {
      setMode("Mapa");
    }
    setPanelState(nextState);

    const target = sheetSnapPoints[nextState];
    sheetY.stopAnimation();
    sheetYRef.current = target;
    Animated.spring(sheetY, {
      toValue: target,
      stiffness: 360,
      damping: 36,
      mass: 0.9,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        sheetYRef.current = target;
      }
    });
  }, [sheetSnapPoints, sheetY]);

  const sheetPanResponder = React.useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 2,
      onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dy) > 2,
      onPanResponderGrant: () => {
        const snappedY = sheetSnapPoints[panelStateRef.current];
        const fallbackY = Math.abs(sheetYRef.current - snappedY) > 160 ? snappedY : sheetYRef.current;
        sheetDragStartYRef.current = fallbackY;
        sheetY.stopAnimation((value) => {
          const startY = Math.abs(value - fallbackY) > 160 ? fallbackY : value;
          sheetDragStartYRef.current = startY;
          sheetYRef.current = startY;
        });
      },
      onPanResponderMove: (_, gesture) => {
        if (stageHeight <= 0) {
          return;
        }
        const nextY = clamp(sheetDragStartYRef.current + gesture.dy, sheetSnapPoints.list, sheetSnapPoints.map);
        sheetYRef.current = nextY;
        sheetY.setValue(nextY);
      },
      onPanResponderRelease: (_, gesture) => {
        const nextY = clamp(sheetDragStartYRef.current + gesture.dy, sheetSnapPoints.list, sheetSnapPoints.map);
        const nextState = nearestPanelState(nextY, sheetSnapPoints);
        snapToPanel(nextState);
      },
      onPanResponderTerminate: () => {
        snapToPanel(panelState);
      },
    }),
    [panelState, sheetSnapPoints, sheetY, snapToPanel, stageHeight],
  );

  useFocusEffect(
    React.useCallback(() => {
      setMapAnimationKey((key) => key + 1);
      if (stageHeight > 0) {
        snapToPanel("split");
        return;
      }
      panelStateRef.current = "split";
      setMode("Mapa");
      setPanelState("split");
    }, [snapToPanel, stageHeight]),
  );

  React.useEffect(() => {
    const listenerId = sheetY.addListener(({ value }) => {
      sheetYRef.current = value;
    });

    return () => sheetY.removeListener(listenerId);
  }, [sheetY]);

  React.useEffect(() => {
    if (stageHeight <= 0 || sheetPositionReadyRef.current) {
      return;
    }
    const target = sheetSnapPoints[panelState];
    sheetY.setValue(target);
    sheetYRef.current = target;
    panelStateRef.current = panelState;
    sheetPositionReadyRef.current = true;
  }, [panelState, sheetSnapPoints, sheetY, stageHeight]);

  React.useEffect(() => {
    if (!pinnedMapId && pinnedSource === "nearest" && closestRestaurant && selectedId !== closestRestaurant.id) {
      setSelectedId(closestRestaurant.id);
      return;
    }
    if (closestRestaurant && !filtered.some((restaurant) => restaurant.id === selectedId)) {
      setSelectedId(closestRestaurant.id);
    }
    if (pinnedMapId && !filtered.some((restaurant) => restaurant.id === pinnedMapId)) {
      setPinnedMapId(undefined);
      setPinnedSource("nearest");
    }
  }, [closestRestaurant, filtered, selectedId, pinnedMapId, pinnedSource]);

  function handleModeSelect(nextMode: "Mapa" | "Lista") {
    if (nextMode === "Lista") {
      snapToPanel("list");
      return;
    }
    snapToPanel(panelState === "list" ? "split" : panelState);
  }

  function handleHandlePress() {
    if (panelState === "list") {
      snapToPanel("split");
      return;
    }
    if (panelState === "split") {
      snapToPanel("map");
      return;
    }
    snapToPanel("list");
  }

  function handleMapSelect(restaurantId: number) {
    setSelectedId(restaurantId);
    setPinnedMapId(restaurantId);
    setPinnedSource("map");
    snapToPanel("split");
    requestAnimationFrame(() => {
      restaurantListRef.current?.scrollTo({ y: 0, animated: true });
    });
  }

  return (
    <AppBackground>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar restaurante" />
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
                    onPress={() => handleModeSelect(item)}
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
          {!hasUserLocation ? (
            <Pressable
              onPress={requestUserLocation}
              style={{
                minHeight: 48,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <LocateFixed color={theme.accent} size={18} strokeWidth={2.5} />
              <Text selectable style={{ flex: 1, color: theme.text, fontWeight: "800" }}>
                {locationLoading ? "Buscando sua localizacao..." : "Ative a localizacao para ver os restaurantes mais proximos."}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View
          onLayout={(event) => {
            const nextHeight = event.nativeEvent.layout.height;
            if (Math.abs(nextHeight - stageHeight) > 1) {
              sheetPositionReadyRef.current = false;
              setStageHeight(nextHeight);
            }
          }}
          style={{ flex: 1, marginTop: 8, overflow: "hidden", backgroundColor: theme.dark ? "#101820" : "#DCE7F2" }}
        >
          {stageHeight > 0 ? (
            <MapPreview
              restaurants={filtered}
              selectedId={pinnedRestaurantId}
              onSelect={handleMapSelect}
              height={stageHeight}
              expanded={panelState === "map"}
              showsUserLocation={hasUserLocation}
              animationKey={mapAnimationKey}
            />
          ) : null}

          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(stageHeight, 1),
              paddingHorizontal: 20,
              paddingTop: 10,
              borderTopLeftRadius: panelState === "list" ? 0 : 22,
              borderTopRightRadius: panelState === "list" ? 0 : 22,
              backgroundColor: theme.dark ? "#081018" : theme.background,
              transform: [{ translateY: sheetY }],
            }}
          >
            <View
              style={{ alignItems: "center", paddingTop: 6, paddingBottom: 18 }}
              {...sheetPanResponder.panHandlers}
            >
              <Pressable onPress={handleHandlePress} hitSlop={18}>
                <View
                  style={{
                    width: 64,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: theme.dark ? "rgba(255,255,255,0.30)" : "rgba(16,24,40,0.22)",
                  }}
                />
              </Pressable>
            </View>

            <ScrollView
              ref={restaurantListRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 112, gap: 2 }}
            >
              {selectedRestaurant && showPinnedRestaurant ? (
                <View style={{ gap: 8, paddingBottom: 10 }}>
                  <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
                    {pinnedSource === "map" ? "Selecionado no mapa" : "Mais proximo de voce"}
                  </Text>
                  <SelectedMapRestaurantCard restaurant={selectedRestaurant} />
                </View>
              ) : null}
              <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
                {showPinnedRestaurant
                  ? `Parceiros (${partnerRestaurants.length})`
                  : `Exibindo ${filtered.length} parceiros em Santos`}
              </Text>
              {partnerRestaurants.map((restaurant) => (
                <RestaurantListItem key={restaurant.id} restaurant={restaurant} />
              ))}
            </ScrollView>
          </Animated.View>

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: CITY_BAR_HEIGHT,
              borderBottomLeftRadius: panelState === "list" ? 0 : 16,
              borderBottomRightRadius: panelState === "list" ? 0 : 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.dark ? "#081018" : theme.background,
              zIndex: 5,
            }}
          >
            <Text selectable style={{ color: theme.text, fontSize: 13, fontWeight: "900" }}>
              Santos - SP
            </Text>
          </View>
        </View>
      </View>
    </AppBackground>
  );
}

function SelectedMapRestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const theme = useAppTheme();
  const serviceMode = formatServiceMode(restaurant.service_mode);
  const hasDistance = typeof restaurant.distance_meters === "number";

  return (
    <Pressable
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      style={{
        minHeight: 126,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        flexDirection: "row",
      }}
    >
      <Image source={{ uri: restaurant.image_url }} style={{ width: 124, minHeight: 126 }} contentFit="cover" />
      <View style={{ flex: 1, padding: 12, gap: 7, minWidth: 0 }}>
        <View style={{ gap: 3 }}>
          <Text selectable numberOfLines={1} style={{ color: theme.text, fontSize: 19, fontWeight: "900" }}>
            {restaurant.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MapPin color={theme.accent} size={14} strokeWidth={2.6} />
            <Text selectable numberOfLines={1} style={{ color: theme.muted, fontSize: 13, fontWeight: "800" }}>
              {restaurant.neighborhood}
              {hasDistance ? ` • ${formatDistance(restaurant.distance_meters)}` : ""}
            </Text>
          </View>
        </View>
        <Text selectable numberOfLines={2} style={{ color: theme.text, lineHeight: 19 }}>
          {restaurant.promotion?.description}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Text selectable numberOfLines={1} style={{ color: theme.muted, fontSize: 12, fontWeight: "900" }}>
            {serviceMode}
          </Text>
          {restaurant.is_visited ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <CheckCircle2 color={theme.accent} size={13} strokeWidth={2.6} />
              <Text selectable style={{ color: theme.accent, fontSize: 12, fontWeight: "900" }}>
                Visitado
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
