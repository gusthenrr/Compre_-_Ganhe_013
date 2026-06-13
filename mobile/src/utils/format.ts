export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDistance(meters?: number | null) {
  if (typeof meters !== "number") {
    return "";
  }
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
  }
  return `${meters} m`;
}

export function formatServiceMode(value: string) {
  return value === "Ambos" ? "Presencial e delivery" : value;
}

export function formatBirthDate(value?: string | null) {
  if (!value) {
    return "";
  }
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
}
