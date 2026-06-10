export type Promotion = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  rules?: string | null;
};

export type Restaurant = {
  id: number;
  name: string;
  segment: string;
  neighborhood: string;
  address: string;
  phone: string;
  instagram: string;
  image_url: string;
  logo_url: string;
  promotion_book_image_url: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  accepts_in_person: boolean;
  accepts_delivery: boolean;
  service_mode: string;
  pet_friendly: boolean;
  kids_area: boolean;
  is_favorite: boolean;
  is_visited: boolean;
  promotion: Promotion | null;
};

export type User = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  identifier?: string | null;
  birth_date?: string | null;
  auth_provider: "manual" | "google";
  visited_count: number;
  total_saved: number;
  remaining_promotions: number;
};

export type RegisterPayload = {
  identifier: string;
  password: string;
  name: string;
  birth_date: string;
};
