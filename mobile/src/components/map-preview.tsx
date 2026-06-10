import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { useAppData } from "@/context/app-data-context";
import { palette, useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";

import { FavoriteButton } from "./favorite-button";

type Props = {
  restaurants: Restaurant[];
  selectedId?: number;
  onSelect: (restaurantId: number) => void;
  expanded: boolean;
};

const positions = [
  [15, 24],
  [42, 18],
  [62, 32],
  [30, 44],
  [72, 54],
  [54, 67],
  [20, 66],
  [82, 24],
  [38, 76],
  [68, 78],
] as const;

function pinColor(restaurant: Restaurant) {
  if (restaurant.is_favorite) {
    return palette.yellow;
  }
  if (restaurant.is_visited) {
    return palette.greenPin;
  }
  return palette.bluePin;
}

export function MapPreview({ restaurants, selectedId, onSelect, expanded }: Props) {
  const theme = useAppTheme();
  const { toggleFavorite } = useAppData();
  const selected = restaurants.find((item) => item.id === selectedId) ?? restaurants[0];

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          height: expanded ? 430 : 260,
          borderRadius: 22,
          overflow: "hidden",
          backgroundColor: theme.dark ? "#132033" : "#D8E4F1",
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <View style={{ position: "absolute", inset: 0, opacity: theme.dark ? 0.42 : 0.56 }}>
          {Array.from({ length: 9 }).map((_, index) => (
            <View
              key={`h-${index}`}
              style={{
                position: "absolute",
                left: -20,
                right: -20,
                top: `${12 + index * 10}%`,
                height: 2,
                backgroundColor: theme.dark ? "#52657E" : "#9CB2CB",
                transform: [{ rotate: index % 2 ? "-16deg" : "12deg" }],
              }}
            />
          ))}
          {Array.from({ length: 7 }).map((_, index) => (
            <View
              key={`v-${index}`}
              style={{
                position: "absolute",
                top: -40,
                bottom: -40,
                left: `${8 + index * 14}%`,
                width: 2,
                backgroundColor: theme.dark ? "#52657E" : "#9CB2CB",
                transform: [{ rotate: index % 2 ? "18deg" : "-10deg" }],
              }}
            />
          ))}
        </View>

        <View
          style={{
            position: "absolute",
            left: -40,
            bottom: -26,
            width: "62%",
            height: "42%",
            borderTopRightRadius: 140,
            backgroundColor: theme.dark ? "#0A223A" : "#BBD4EC",
          }}
        />

        {restaurants.slice(0, 10).map((restaurant, index) => {
          const position = positions[index % positions.length];
          const selectedPin = restaurant.id === selected?.id;
          return (
            <Pressable
              key={restaurant.id}
              onPress={() => onSelect(restaurant.id)}
              style={{
                position: "absolute",
                left: `${position[0]}%`,
                top: `${position[1]}%`,
                width: selectedPin ? 42 : 34,
                height: selectedPin ? 42 : 34,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.dark ? "#07111E" : "#FFFFFF",
                borderWidth: selectedPin ? 3 : 2,
                borderColor: pinColor(restaurant),
              }}
            >
              <MapPin color={pinColor(restaurant)} fill={pinColor(restaurant)} size={selectedPin ? 21 : 17} strokeWidth={2.6} />
            </Pressable>
          );
        })}

        <View
          style={{
            position: "absolute",
            left: 14,
            top: 14,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: theme.dark ? "rgba(8,11,16,0.78)" : "rgba(255,255,255,0.88)",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <MapPin color={theme.accent} size={16} strokeWidth={2.5} />
          <Text selectable style={{ color: theme.text, fontWeight: "900" }}>
            Santos - SP
          </Text>
        </View>
      </View>

      {selected ? (
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            padding: 12,
            borderRadius: 20,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Image source={{ uri: selected.logo_url }} style={{ width: 64, height: 64, borderRadius: 16 }} contentFit="cover" />
          <View style={{ flex: 1, gap: 5, minWidth: 0 }}>
            <Text selectable numberOfLines={1} style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>
              {selected.name}
            </Text>
            <Text selectable numberOfLines={1} style={{ color: theme.muted, fontWeight: "700" }}>
              {selected.neighborhood} • {selected.service_mode}
            </Text>
            <Text selectable numberOfLines={2} style={{ color: theme.text, lineHeight: 19 }}>
              {selected.promotion?.description}
            </Text>
            <Pressable onPress={() => router.push(`/restaurant/${selected.id}`)} style={{ alignSelf: "flex-start", paddingTop: 3 }}>
              <Text selectable style={{ color: theme.accent, fontWeight: "900" }}>
                Ver detalhes
              </Text>
            </Pressable>
          </View>
          <FavoriteButton active={selected.is_favorite} onPress={() => toggleFavorite(selected.id)} size={20} />
        </View>
      ) : null}
    </View>
  );
}
