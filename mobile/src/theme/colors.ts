import { useColorScheme } from "react-native";

export const palette = {
  navy: "#06234F",
  darkBottom: "#080B10",
  accent: "#35E481",
  yellow: "#F7C948",
  bluePin: "#2F80ED",
  greenPin: "#35E481",
  purple: "#BFA8FF",
  danger: "#EF4444",
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  return {
    dark,
    primary: palette.navy,
    accent: palette.accent,
    background: dark ? "#07111E" : "#F6F8FC",
    gradient: dark ? ["#06234F", "#0B1521", "#080B10"] : ["#F7FAFF", "#EEF4FF", "#F6F8FC"],
    surface: dark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
    surfaceStrong: dark ? "rgba(255,255,255,0.13)" : "#EAF0FA",
    input: dark ? "rgba(255,255,255,0.10)" : "#FFFFFF",
    text: dark ? "#F8FAFC" : "#101828",
    muted: dark ? "#B8C2D3" : "#667085",
    placeholder: dark ? "#7D8797" : "#98A2B3",
    border: dark ? "rgba(255,255,255,0.12)" : "#DDE5F2",
    navBackground: dark ? "#090F16" : "#FFFFFF",
    tabMuted: dark ? "#A7AFBD" : "#667085",
    chip: dark ? "rgba(255,255,255,0.10)" : "#EAF0FA",
    danger: palette.danger,
  };
}
