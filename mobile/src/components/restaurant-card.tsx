import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useAppData } from "@/context/app-data-context";
import { Restaurant } from "@/types";
import { formatDistance } from "@/utils/format";

import { FavoriteButton } from "./favorite-button";
import { useAppTheme } from "@/theme/colors";

type Props = {
  restaurant: Restaurant;
};

export function RestaurantCard({ restaurant }: Props) {
  const theme = useAppTheme();
  const { toggleFavorite } = useAppData();

  return (
    <Pressable
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      style={{
        width: 286,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Image source={{ uri: restaurant.image_url }} style={{ width: "100%", aspectRatio: 1.7 }} contentFit="cover" />
      <View style={{ padding: 14, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text selectable numberOfLines={1} style={{ color: theme.text, fontSize: 19, fontWeight: "900" }}>
              {restaurant.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <MapPin color={theme.accent} size={15} strokeWidth={2.6} />
              <Text selectable numberOfLines={1} style={{ color: theme.muted, fontWeight: "700" }}>
                {restaurant.neighborhood} • {formatDistance(restaurant.distance_meters)}
              </Text>
            </View>
          </View>
          <FavoriteButton active={restaurant.is_favorite} onPress={() => toggleFavorite(restaurant.id)} />
        </View>

        <Text selectable numberOfLines={2} style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>
          {restaurant.promotion?.description}
        </Text>

        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: restaurant.is_visited ? "rgba(53,228,129,0.16)" : theme.surfaceStrong,
          }}
        >
          <Text selectable style={{ color: restaurant.is_visited ? theme.accent : theme.muted, fontSize: 12, fontWeight: "900" }}>
            {restaurant.is_visited ? "Ja visitado" : restaurant.service_mode}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
