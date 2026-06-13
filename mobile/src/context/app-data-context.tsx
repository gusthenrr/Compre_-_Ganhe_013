import * as Location from "expo-location";
import * as React from "react";
import { AppState, Platform } from "react-native";

import { favoriteRequest, restaurantsRequest, usePromotionRequest } from "@/api/client";
import { demoRestaurants } from "@/data/mock-data";
import { Restaurant } from "@/types";

import { useAuth } from "./auth-context";

type AppDataContextValue = {
  restaurants: Restaurant[];
  loading: boolean;
  userLocation: UserCoordinates | null;
  hasUserLocation: boolean;
  locationLoading: boolean;
  locationError: string | null;
  requestUserLocation: () => Promise<void>;
  refreshRestaurants: () => Promise<void>;
  toggleFavorite: (restaurantId: number) => Promise<void>;
  registerUse: (restaurantId: number, savingsValue: number, photoUrl?: string) => Promise<void>;
  findRestaurant: (restaurantId: number) => Restaurant | undefined;
};

type UserCoordinates = {
  latitude: number;
  longitude: number;
};

const AppDataContext = React.createContext<AppDataContextValue | null>(null);

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceBetweenMeters(from: UserCoordinates, to: UserCoordinates) {
  const earthRadiusMeters = 6371000;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

function withLocationDistances(restaurants: Restaurant[], userLocation: UserCoordinates | null) {
  if (!userLocation) {
    return restaurants.map((restaurant) => ({ ...restaurant, distance_meters: null }));
  }

  return restaurants
    .map((restaurant) => ({
      ...restaurant,
      distance_meters: distanceBetweenMeters(userLocation, {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }),
    }))
    .sort((first, second) => (first.distance_meters ?? Number.MAX_SAFE_INTEGER) - (second.distance_meters ?? Number.MAX_SAFE_INTEGER));
}

function recomputeUserTotals(restaurants: Restaurant[], currentUser: ReturnType<typeof useAuth>["user"], addedValue = 0) {
  if (!currentUser) {
    return null;
  }
  const visitedCount = restaurants.filter((item) => item.is_visited).length;
  return {
    ...currentUser,
    visited_count: visitedCount,
    total_saved: Number((currentUser.total_saved + addedValue).toFixed(2)),
    remaining_promotions: Math.max(restaurants.length - visitedCount, 0),
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { token, user, updateUser } = useAuth();
  const [rawRestaurants, setRawRestaurants] = React.useState<Restaurant[]>(demoRestaurants);
  const [loading, setLoading] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<UserCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const locationRequestInFlight = React.useRef(false);

  const restaurants = React.useMemo(() => withLocationDistances(rawRestaurants, userLocation), [rawRestaurants, userLocation]);

  const requestUserLocation = React.useCallback(async () => {
    if (process.env.EXPO_OS === "web" || locationRequestInFlight.current) {
      return;
    }

    locationRequestInFlight.current = true;
    setLocationLoading(true);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled && Platform.OS === "android") {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          // The OS prompt can be dismissed; the permission flow below still reports the final state.
        }
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setUserLocation(null);
        setLocationError("Ative a localizacao para ver os restaurantes mais proximos.");
        return;
      }

      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) {
        setUserLocation(null);
        setLocationError("Ligue a localizacao do aparelho para calcular as distancias.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
      setLocationError(null);
    } catch {
      setUserLocation(null);
      setLocationError("Nao foi possivel acessar sua localizacao agora.");
    } finally {
      locationRequestInFlight.current = false;
      setLocationLoading(false);
    }
  }, []);

  async function refreshRestaurants() {
    if (!token || token === "demo-token") {
      setRawRestaurants((items) => (items.length ? items : demoRestaurants));
      return;
    }

    setLoading(true);
    try {
      const response = await restaurantsRequest(token);
      setRawRestaurants(response.restaurants);
    } catch {
      setRawRestaurants((items) => (items.length ? items : demoRestaurants));
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(restaurantId: number) {
    const current = rawRestaurants.find((item) => item.id === restaurantId);
    if (!current) {
      return;
    }
    const nextFavorite = !current.is_favorite;
    setRawRestaurants((items) =>
      items.map((item) => (item.id === restaurantId ? { ...item, is_favorite: nextFavorite } : item)),
    );

    if (token && token !== "demo-token") {
      try {
        const response = await favoriteRequest(token, restaurantId, nextFavorite);
        setRawRestaurants((items) => items.map((item) => (item.id === restaurantId ? response.restaurant : item)));
      } catch {
        setRawRestaurants((items) =>
          items.map((item) => (item.id === restaurantId ? { ...item, is_favorite: current.is_favorite } : item)),
        );
      }
    }
  }

  async function registerUse(restaurantId: number, savingsValue: number, photoUrl?: string) {
    const current = rawRestaurants.find((item) => item.id === restaurantId);
    if (!current) {
      return;
    }
    if (current.is_visited) {
      throw new Error("Essa promocao ja foi registrada.");
    }

    const nextRestaurants = rawRestaurants.map((item) => (item.id === restaurantId ? { ...item, is_visited: true } : item));
    setRawRestaurants(nextRestaurants);

    if (token && token !== "demo-token") {
      const response = await usePromotionRequest(token, restaurantId, savingsValue, photoUrl);
      setRawRestaurants((items) => items.map((item) => (item.id === restaurantId ? response.restaurant : item)));
      await updateUser(response.user);
      return;
    }

    const nextUser = recomputeUserTotals(nextRestaurants, user, savingsValue);
    if (nextUser) {
      await updateUser(nextUser);
    }
  }

  function findRestaurant(restaurantId: number) {
    return restaurants.find((item) => item.id === restaurantId);
  }

  React.useEffect(() => {
    if (token) {
      refreshRestaurants();
    }
  }, [token]);

  React.useEffect(() => {
    requestUserLocation();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        requestUserLocation();
      }
    });

    return () => subscription.remove();
  }, [requestUserLocation]);

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      restaurants,
      loading,
      userLocation,
      hasUserLocation: Boolean(userLocation),
      locationLoading,
      locationError,
      requestUserLocation,
      refreshRestaurants,
      toggleFavorite,
      registerUse,
      findRestaurant,
    }),
    [restaurants, loading, userLocation, locationLoading, locationError, requestUserLocation, token, user],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = React.use(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }
  return context;
}
