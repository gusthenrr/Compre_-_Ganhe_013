import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Camera, CheckCircle2, ExternalLink, MapPin, Phone } from "lucide-react-native";
import * as React from "react";
import { Animated, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { FavoriteButton } from "@/components/favorite-button";
import { useAppData } from "@/context/app-data-context";
import { useAppTheme } from "@/theme/colors";
import { formatDistance, formatServiceMode } from "@/utils/format";

export default function RestaurantDetailScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findRestaurant, toggleFavorite, registerUse } = useAppData();
  const restaurant = findRestaurant(Number(id));
  const [modalVisible, setModalVisible] = React.useState(false);
  const [savings, setSavings] = React.useState("");
  const [photoUri, setPhotoUri] = React.useState("");
  const [error, setError] = React.useState("");
  const [actionsDocked, setActionsDocked] = React.useState(false);
  const actionsAnchorY = React.useRef(0);
  const actionAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(actionAnimation, {
      toValue: actionsDocked ? 0 : 1,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
  }, [actionAnimation, actionsDocked]);

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
  const serviceMode = formatServiceMode(restaurant.service_mode);
  const hasDistance = typeof restaurant.distance_meters === "number";

  function openRoute() {
    const query = `${activeRestaurant.latitude},${activeRestaurant.longitude}`;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${query}`);
  }

  function openUseModal() {
    setError("");
    setModalVisible(true);
  }

  async function openCamera() {
    setError("");
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Permita acesso a camera para anexar a foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.78,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0]?.uri ?? "");
    }
  }

  async function confirmUse() {
    setError("");
    const value = Number(savings.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe quanto voce economizou.");
      return;
    }
    try {
      await registerUse(activeRestaurant.id, value, photoUri || undefined);
      setSavings("");
      setPhotoUri("");
      setModalVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel registrar o uso.");
    }
  }

  function handleScroll(offsetY: number) {
    if (!actionsAnchorY.current) {
      return;
    }
    const shouldDock = offsetY + windowHeight >= actionsAnchorY.current + 106;
    setActionsDocked((current) => (current === shouldDock ? current : shouldDock));
  }

  function renderActionButtons(layout: "row" | "column") {
    const compact = layout === "row";
    const iconSize = compact ? 18 : 20;
    const buttonGap = compact ? 6 : 8;

    return (
      <View style={{ flexDirection: layout, gap: 10 }}>
        <Pressable
          onPress={openRoute}
          style={{
            flex: layout === "row" ? 1 : undefined,
            minHeight: 54,
            borderRadius: 16,
            backgroundColor: theme.surfaceStrong,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: buttonGap,
            paddingHorizontal: compact ? 8 : 12,
            overflow: "hidden",
          }}
        >
          <MapPin color={theme.text} size={iconSize} strokeWidth={2.5} />
          <Text
            selectable
            numberOfLines={1}
            adjustsFontSizeToFit={compact}
            minimumFontScale={0.82}
            style={{ color: theme.text, fontSize: compact ? 13 : undefined, fontWeight: "900", flexShrink: 1, textAlign: "center" }}
          >
            Abrir rota
          </Text>
        </Pressable>
        <Pressable
          onPress={openUseModal}
          disabled={activeRestaurant.is_visited}
          style={{
            flex: layout === "row" ? 1 : undefined,
            minHeight: 54,
            borderRadius: 16,
            backgroundColor: activeRestaurant.is_visited ? theme.surfaceStrong : theme.primary,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: buttonGap,
            paddingHorizontal: compact ? 8 : 12,
            overflow: "hidden",
          }}
        >
          <CheckCircle2 color={activeRestaurant.is_visited ? theme.accent : "#FFFFFF"} size={iconSize} strokeWidth={2.5} />
          <Text
            selectable
            numberOfLines={1}
            adjustsFontSizeToFit={compact}
            minimumFontScale={0.82}
            style={{
              color: activeRestaurant.is_visited ? theme.accent : "#FFFFFF",
              fontSize: compact ? 13 : undefined,
              fontWeight: "900",
              flexShrink: 1,
              textAlign: "center",
            }}
          >
            {activeRestaurant.is_visited ? "Ja usado" : "Marcar como usado"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <AppBackground>
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        scrollEventThrottle={16}
        onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}
        contentContainerStyle={{ paddingBottom: 112 + insets.bottom }}
      >
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
                {hasDistance ? ` • ${formatDistance(restaurant.distance_meters)}` : ""}
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
            {hasDistance ? <InfoRow icon={<MapPin color={theme.accent} size={18} strokeWidth={2.5} />} text={`${formatDistance(restaurant.distance_meters)} de voce`} /> : null}
            <InfoRow icon={<Phone color={theme.accent} size={18} strokeWidth={2.5} />} text={restaurant.phone} />
            <InfoRow icon={<ExternalLink color={theme.accent} size={18} strokeWidth={2.5} />} text={restaurant.instagram} />
            <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
              Tipo: {serviceMode}
            </Text>
            <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
              Pet friendly: {restaurant.pet_friendly ? "Sim" : "Nao"}
            </Text>
            <Text selectable style={{ color: theme.muted, fontWeight: "800" }}>
              Area kids: {restaurant.kids_area ? "Sim" : "Nao"}
            </Text>
          </View>

          <Animated.View
            onLayout={(event) => {
              actionsAnchorY.current = event.nativeEvent.layout.y;
            }}
            style={{
              opacity: actionAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [{ translateY: actionAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) }],
            }}
          >
            {renderActionButtons("column")}
          </Animated.View>
        </View>
      </Animated.ScrollView>

      <Animated.View
        pointerEvents={actionsDocked ? "none" : "auto"}
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom + 14, 18),
          padding: 10,
          borderRadius: 20,
          backgroundColor: theme.background,
          borderWidth: 1,
          borderColor: theme.border,
          opacity: actionAnimation,
          transform: [
            { translateY: actionAnimation.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
            { scale: actionAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
          ],
          shadowColor: "#000000",
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        {renderActionButtons("row")}
      </Animated.View>

      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={insets.top} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.48)" }}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}>
              <View
                style={{
                  maxHeight: windowHeight - insets.top - 18,
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 20 + insets.bottom,
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
                <Pressable
                  onPress={openCamera}
                  style={{
                    minHeight: 56,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    backgroundColor: theme.surfaceStrong,
                    borderWidth: 1,
                    borderColor: theme.border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Camera color={theme.text} size={20} strokeWidth={2.5} />
                  <Text selectable style={{ color: theme.text, fontWeight: "900" }}>
                    {photoUri ? "Tirar outra foto" : "Tirar foto"}
                  </Text>
                </Pressable>
                {photoUri ? <Image source={{ uri: photoUri }} style={{ width: "100%", aspectRatio: 1.95, borderRadius: 16, backgroundColor: theme.surfaceStrong }} contentFit="cover" /> : null}
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
            </ScrollView>
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
