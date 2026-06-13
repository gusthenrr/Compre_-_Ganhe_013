import * as React from "react";
import { useWindowDimensions, View } from "react-native";
import MapView, { MapStyleElement, Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { palette, useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";

type Props = {
  restaurants: Restaurant[];
  selectedId?: number;
  onSelect: (restaurantId: number) => void;
  height: number;
  expanded: boolean;
  showsUserLocation: boolean;
  animationKey: number;
};

const PIN_INTRO_DELAY_MS = 170;
const PIN_STAGGER_MS = 85;
const CLEAN_MAP_STYLE: MapStyleElement[] = [
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

function pinColor(restaurant: Restaurant) {
  if (restaurant.is_favorite) {
    return palette.yellow;
  }
  if (restaurant.is_visited) {
    return palette.greenPin;
  }
  return palette.bluePin;
}

export function MapPreview({ restaurants, selectedId, onSelect, height, expanded, showsUserLocation, animationKey }: Props) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const mapRef = React.useRef<MapView>(null);
  const restaurantsRef = React.useRef(restaurants);
  const pinTimersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const pinIntroRunRef = React.useRef(0);
  const [mapReady, setMapReady] = React.useState(false);
  const [visiblePinIds, setVisiblePinIds] = React.useState<Set<number>>(() => new Set());
  const selected = restaurants.find((item) => item.id === selectedId) ?? restaurants[0];
  const centerLatitude = selected?.latitude ?? -23.9608;
  const centerLongitude = selected?.longitude ?? -46.3336;
  const latitudeDelta = expanded ? 0.065 : 0.038;
  const longitudeDelta = expanded ? 0.052 : 0.03;
  const restaurantKey = restaurants.map((restaurant) => restaurant.id).join("|");
  restaurantsRef.current = restaurants;

  const clearPinTimers = React.useCallback(() => {
    pinTimersRef.current.forEach((timer) => clearTimeout(timer));
    pinTimersRef.current = [];
  }, []);

  const schedulePinIntro = React.useCallback(() => {
    clearPinTimers();
    const nextRestaurants = restaurantsRef.current;
    const runId = pinIntroRunRef.current + 1;
    pinIntroRunRef.current = runId;

    setVisiblePinIds(new Set());

    nextRestaurants.forEach((restaurant, index) => {
      const timer = setTimeout(() => {
        if (pinIntroRunRef.current !== runId) {
          return;
        }

        setVisiblePinIds((current) => {
          const next = new Set(current);
          next.add(restaurant.id);
          return next;
        });
      }, PIN_INTRO_DELAY_MS + index * PIN_STAGGER_MS);

      pinTimersRef.current.push(timer);
    });
  }, [clearPinTimers]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: centerLatitude,
          longitude: centerLongitude,
          latitudeDelta,
          longitudeDelta,
        },
        90,
      );
    }, 45);

    return () => clearTimeout(timeout);
  }, [centerLatitude, centerLongitude, latitudeDelta, longitudeDelta]);

  React.useEffect(() => {
    return () => {
      clearPinTimers();
      pinIntroRunRef.current += 1;
    };
  }, [clearPinTimers]);

  React.useEffect(() => {
    if (mapReady) {
      schedulePinIntro();
    }
  }, [animationKey, mapReady, restaurantKey, schedulePinIntro]);

  return (
    <View style={{ height, overflow: "hidden", backgroundColor: theme.dark ? "#101820" : "#DCE7F2" }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width, height }}
        initialRegion={{
          latitude: centerLatitude,
          longitude: centerLongitude,
          latitudeDelta,
          longitudeDelta,
        }}
        toolbarEnabled={false}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={showsUserLocation}
        customMapStyle={CLEAN_MAP_STYLE}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady ? restaurants.map((restaurant) => {
          if (!visiblePinIds.has(restaurant.id)) {
            return null;
          }

          const active = restaurant.id === selected?.id;

          return (
            <Marker
              key={restaurant.id}
              anchor={{ x: 0.5, y: 1 }}
              coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
              onPress={() => onSelect(restaurant.id)}
              pinColor={pinColor(restaurant)}
              tracksViewChanges={false}
              zIndex={active ? 2 : 1}
            />
          );
        }) : null}
      </MapView>

      {theme.dark ? <View pointerEvents="none" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(6, 14, 24, 0.18)" }} /> : null}
    </View>
  );
}
