import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, ExternalLink, MapPin, Phone } from "lucide-react-native";
import * as React from "react";
import { KeyboardAvoidingView, Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { FavoriteButton } from "@/components/favorite-button";
import { useAppData } from "@/context/app-data-context";
import { useAppTheme } from "@/theme/colors";

export default function RestaurantDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findRestaurant, toggleFavorite, registerUse } = useAppData();
  const restaurant = findRestaurant(Number(id));
  const [modalVisible, setModalVisible] = React.useState(false);
  const [savings, setSavings] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [error, setError] = React.useState("");

  if (!restaurant) {
    return (
      <AppBackground>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text selectable style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>
            Restaurante nao encontrado.
          </Text>
        </View>
      </AppBackground>
    );
  }

  const activeRestaurant = restaurant;

  function openRoute() {
    const query = `${activeRestaurant.latitude},${activeRestaurant.longitude}`;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  async function confirmUse() {
    setError("");
    const value = Number(savings.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe quanto voce economizou.");
      return;
    }
    try {
      await registerUse(activeRestaurant.id, value, photoUrl.trim() || undefined);
      setSavings("");
      setPhotoUrl("");
      setModalVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel registrar o uso.");
    }
  }

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: restaurant.image_url }} style={{ width: "100%", aspectRatio: 1.28 }} contentFit="cover" />
          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.44)",
            }}
          >
            <ArrowLeft color="#FFFFFF" size={22} strokeWidth={2.5} />
          </Pressable>
        </View>

        <View style={{ padding: 20, gap: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
              <Text selectable style={{ color: theme.text, fontSize: 30, fontWeight: "900" }}>
                {restaurant.name}
              </Text>
              <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
                {restaurant.segment} • {restaurant.neighborhood}
              </Text>
            </View>
            <FavoriteButton active={restaurant.is_favorite} onPress={() => toggleFavorite(restaurant.id)} />
          </View>

          <View style={{ padding: 16, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, gap: 12 }}>
            <Text selectable style={{ color: theme.text, fontSize: 19, fontWeight: "900" }}>
              Promocao
            </Text>
            <Text selectable style={{ color: theme.text, fontSize: 17, lineHeight: 24 }}>
              {restaurant.promotion?.description}
            </Text>
            <Image source={{ uri: restaurant.promotion_book_image_url }} style={{ width: "100%", aspectRatio: 1.75, borderRadius: 16 }} contentFit="cover" />
            {restaurant.promotion?.rules ? (
              <Text selectable style={{ color: theme.muted, lineHeight: 20 }}>
                {restaurant.promotion.rules}
              </Text>
            ) : null}
          </View>

          <View style={{ padding: 16, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, gap: 10 }}>
            <Text selectable style={{ color: theme.text, fontSize: 19, fontWeight: "900" }}>
              Informacoes
            </Text>
            <InfoRow icon={<MapPin color={theme.accent} size={18} strokeWidth={2.5} />} text={restaurant.address} />
            <InfoRow icon={<Phone color={theme.accent} size={18} strokeWidth={2.5} />} text={restaurant.phone} />
            <InfoRow icon={<ExternalLink color={theme.accent} size={18} strokeWidth={2.5} />} text={restaurant.instagram} />
            <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
              Tipo: {restaurant.service_mode}
            </Text>
            <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
              Pet friendly: {restaurant.pet_friendly ? "Sim" : "Nao"}
            </Text>
            <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
              Area kids: {restaurant.kids_area ? "Sim" : "Nao"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Pressable
              onPress={openRoute}
              style={{
                flex: 1,
                minWidth: 150,
                minHeight: 54,
                borderRadius: 16,
                backgroundColor: theme.surfaceStrong,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <MapPin color={theme.text} size={20} strokeWidth={2.5} />
              <Text selectable style={{ color: theme.text, fontWeight: "900" }}>
                Abrir rota
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setModalVisible(true)}
              disabled={restaurant.is_visited}
              style={{
                flex: 1,
                minWidth: 170,
                minHeight: 54,
                borderRadius: 16,
                backgroundColor: restaurant.is_visited ? theme.surfaceStrong : theme.primary,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <CheckCircle2 color={restaurant.is_visited ? theme.accent : "#FFFFFF"} size={20} strokeWidth={2.5} />
              <Text selectable style={{ color: restaurant.is_visited ? theme.accent : "#FFFFFF", fontWeight: "900" }}>
                {restaurant.is_visited ? "Ja usado" : "Marcar como usado"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.48)" }}>
          <View
            style={{
              padding: 20,
              gap: 14,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text selectable style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>
              Voce usou essa promocao?
            </Text>
            <TextInput
              value={savings}
              onChangeText={setSavings}
              keyboardType="decimal-pad"
              placeholder="Quanto voce economizou? R$"
              placeholderTextColor={theme.placeholder}
              style={{ minHeight: 52, borderRadius: 16, paddingHorizontal: 16, color: theme.text, backgroundColor: theme.input, borderWidth: 1, borderColor: theme.border }}
            />
            <TextInput
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
              placeholder="Foto opcional: URL por enquanto"
              placeholderTextColor={theme.placeholder}
              style={{ minHeight: 52, borderRadius: 16, paddingHorizontal: 16, color: theme.text, backgroundColor: theme.input, borderWidth: 1, borderColor: theme.border }}
            />
            {error ? (
              <Text selectable style={{ color: theme.danger, fontWeight: "800" }}>
                {error}
              </Text>
            ) : null}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, minHeight: 52, borderRadius: 16, backgroundColor: theme.surfaceStrong, alignItems: "center", justifyContent: "center" }}
              >
                <Text selectable style={{ color: theme.text, fontWeight: "900" }}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmUse}
                style={{ flex: 1, minHeight: 52, borderRadius: 16, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center" }}
              >
                <Text selectable style={{ color: "#06111D", fontWeight: "900" }}>
                  Confirmar uso
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AppBackground>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text selectable style={{ color: theme.muted, fontWeight: "800", flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
