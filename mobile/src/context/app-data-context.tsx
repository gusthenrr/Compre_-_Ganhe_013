import * as React from "react";

import { favoriteRequest, restaurantsRequest, usePromotionRequest } from "@/api/client";
import { demoRestaurants } from "@/data/mock-data";
import { Restaurant } from "@/types";

import { useAuth } from "./auth-context";

type AppDataContextValue = {
  restaurants: Restaurant[];
  loading: boolean;
  refreshRestaurants: () => Promise<void>;
  toggleFavorite: (restaurantId: number) => Promise<void>;
  registerUse: (restaurantId: number, savingsValue: number, photoUrl?: string) => Promise<void>;
  findRestaurant: (restaurantId: number) => Restaurant | undefined;
};

const AppDataContext = React.createContext<AppDataContextValue | null>(null);

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
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>(demoRestaurants);
  const [loading, setLoading] = React.useState(false);

  async function refreshRestaurants() {
    if (!token || token === "demo-token") {
      setRestaurants((items) => (items.length ? items : demoRestaurants));
      return;
    }

    setLoading(true);
    try {
      const response = await restaurantsRequest(token);
      setRestaurants(response.restaurants);
    } catch {
      setRestaurants((items) => (items.length ? items : demoRestaurants));
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(restaurantId: number) {
    const current = restaurants.find((item) => item.id === restaurantId);
    if (!current) {
      return;
    }
    const nextFavorite = !current.is_favorite;
    setRestaurants((items) =>
      items.map((item) => (item.id === restaurantId ? { ...item, is_favorite: nextFavorite } : item)),
    );

    if (token && token !== "demo-token") {
      try {
        const response = await favoriteRequest(token, restaurantId, nextFavorite);
        setRestaurants((items) => items.map((item) => (item.id === restaurantId ? response.restaurant : item)));
      } catch {
        setRestaurants((items) =>
          items.map((item) => (item.id === restaurantId ? { ...item, is_favorite: current.is_favorite } : item)),
        );
      }
    }
  }

  async function registerUse(restaurantId: number, savingsValue: number, photoUrl?: string) {
    const current = restaurants.find((item) => item.id === restaurantId);
    if (!current) {
      return;
    }
    if (current.is_visited) {
      throw new Error("Essa promocao ja foi registrada.");
    }

    const nextRestaurants = restaurants.map((item) => (item.id === restaurantId ? { ...item, is_visited: true } : item));
    setRestaurants(nextRestaurants);

    if (token && token !== "demo-token") {
      const response = await usePromotionRequest(token, restaurantId, savingsValue, photoUrl);
      setRestaurants((items) => items.map((item) => (item.id === restaurantId ? response.restaurant : item)));
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

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      restaurants,
      loading,
      refreshRestaurants,
      toggleFavorite,
      registerUse,
      findRestaurant,
    }),
    [restaurants, loading, token, user],
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
