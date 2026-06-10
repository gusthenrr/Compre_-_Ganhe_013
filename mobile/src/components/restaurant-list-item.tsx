import { Image } from "expo-image";
import { router } from "expo-router";
import { CheckCircle2, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useAppData } from "@/context/app-data-context";
import { useAppTheme } from "@/theme/colors";
import { Restaurant } from "@/types";
import { formatDistance } from "@/utils/format";

import { FavoriteButton } from "./favorite-button";

type Props = {
  restaurant: Restaurant;
  compact?: boolean;
};

export function RestaurantListItem({ restaurant, compact = false }: Props) {
  const theme = useAppTheme();
  const { toggleFavorite } = useAppData();

  return (
    <Pressable
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      style={{
        flexDirection: "row",
        gap: 12,
        paddingVertical: compact ? 12 : 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <Image
        source={{ uri: restaurant.logo_url }}
        style={{ width: compact ? 58 : 72, height: compact ? 58 : 72, borderRadius: 16, backgroundColor: theme.surfaceStrong }}
        contentFit="cover"
      />
      <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <Text selectable numberOfLines={1} style={{ color: theme.text, fontSize: compact ? 17 : 19, fontWeight: "900" }}>
              {restaurant.name}
            </Text>
            <Text selectable numberOfLines={1} style={{ color: theme.muted, fontWeight: "700" }}>
              {restaurant.segment} • {restaurant.neighborhood}
            </Text>
          </View>
          <FavoriteButton active={restaurant.is_favorite} onPress={() => toggleFavorite(restaurant.id)} size={20} />
        </View>

        <Text selectable numberOfLines={compact ? 1 : 2} style={{ color: theme.text, lineHeight: 20 }}>
          {restaurant.promotion?.description}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MapPin color={theme.accent} size={14} strokeWidth={2.6} />
            <Text selectable style={{ color: theme.muted, fontSize: 13, fontWeight: "700" }}>
              {formatDistance(restaurant.distance_meters)}
            </Text>
          </View>
          <Text selectable style={{ color: theme.muted, fontSize: 13, fontWeight: "700" }}>
            {restaurant.service_mode}
          </Text>
          {restaurant.is_visited ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <CheckCircle2 color={theme.accent} size={14} strokeWidth={2.6} />
              <Text selectable style={{ color: theme.accent, fontSize: 13, fontWeight: "900" }}>
                Visitado
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
