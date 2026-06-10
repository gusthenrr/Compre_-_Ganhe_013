import * as React from "react";
import { useWindowDimensions, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Svg, { Circle, Path } from "react-native-svg";

import { palette, useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";

type Props = {
  restaurants: Restaurant[];
  selectedId?: number;
  onSelect: (restaurantId: number) => void;
  expanded: boolean;
};

function pinColor(restaurant: Restaurant) {
  if (restaurant.is_favorite) {
    return palette.yellow;
  }
  if (restaurant.is_visited) {
    return palette.greenPin;
  }
  return palette.bluePin;
}

function MapPinMarker({ color, active }: { color: string; active: boolean }) {
  const size = active ? 44 : 36;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 22s7-5.2 7-12A7 7 0 0 0 5 10c0 6.8 7 12 7 12Z" fill={color} />
      <Circle cx={12} cy={10} r={active ? 2.45 : 2.25} fill="#FFFFFF" />
    </Svg>
  );
}

export function MapPreview({ restaurants, selectedId, onSelect, expanded }: Props) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const mapRef = React.useRef<MapView>(null);
  const height = expanded ? 470 : 305;
  const selected = restaurants.find((item) => item.id === selectedId) ?? restaurants[0];
  const centerLatitude = selected?.latitude ?? -23.9608;
  const centerLongitude = selected?.longitude ?? -46.3336;
  const latitudeDelta = expanded ? 0.065 : 0.038;
  const longitudeDelta = expanded ? 0.052 : 0.03;

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
        showsUserLocation
      >
        {restaurants.map((restaurant) => {
          const active = restaurant.id === selected?.id;

          return (
            <Marker
              key={restaurant.id}
              coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
              onPress={() => onSelect(restaurant.id)}
            >
              <MapPinMarker color={pinColor(restaurant)} active={active} />
            </Marker>
          );
        })}
      </MapView>

      {theme.dark ? <View pointerEvents="none" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(6, 14, 24, 0.18)" }} /> : null}
    </View>
  );
}
