import { RegisterPayload, Restaurant, User } from "@/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:5000/api";

type AuthResponse = {
  token: string;
  user: User;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message ?? "Erro de comunicacao com a API.");
  }
  return json as T;
}

export function loginRequest(identifier: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function googleLoginRequest() {
  return request<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ email: "gustavo@email.com", name: "Gustavo" }),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function meRequest(token: string) {
  return request<{ user: User }>("/me", {}, token);
}

export function restaurantsRequest(token: string) {
  return request<{ restaurants: Restaurant[] }>("/restaurants", {}, token);
}

export function favoriteRequest(token: string, restaurantId: number, favorite: boolean) {
  return request<{ restaurant: Restaurant }>(
    `/restaurants/${restaurantId}/favorite`,
    { method: favorite ? "POST" : "DELETE" },
    token,
  );
}

export function usePromotionRequest(token: string, restaurantId: number, savingsValue: number, photoUrl?: string) {
  return request<{ restaurant: Restaurant; user: User }>(
    `/restaurants/${restaurantId}/uses`,
    {
      method: "POST",
      body: JSON.stringify({ savings_value: savingsValue, photo_url: photoUrl }),
    },
    token,
  );
}

export function changePasswordRequest(token: string, currentPassword: string, newPassword: string) {
  return request<{ message: string }>(
    "/me/password",
    {
      method: "PATCH",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    },
    token,
  );
}
