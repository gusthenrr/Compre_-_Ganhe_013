import { SlidersHorizontal } from "lucide-react-native";
import { Pressable, ScrollView, Text } from "react-native";

import { useAppTheme } from "@/theme/colors";

type Props = {
  selected: string;
  onSelect: (value: string) => void;
};

const chips = ["Todos", "Favoritos", "Visitados", "Delivery", "Pet friendly", "Area kids"];

export function FilterChips({ selected, onSelect }: Props) {
  const theme = useAppTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      {chips.map((chip, index) => {
        const active = selected === chip;
        return (
          <Pressable
            key={chip}
            onPress={() => onSelect(chip)}
            style={{
              minHeight: 42,
              borderRadius: 16,
              paddingHorizontal: 14,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              backgroundColor: active ? theme.accent : theme.chip,
              borderWidth: 1,
              borderColor: active ? theme.accent : theme.border,
            }}
          >
            {index === 0 ? <SlidersHorizontal color={active ? "#06111D" : theme.accent} size={17} strokeWidth={2.4} /> : null}
            <Text selectable style={{ color: active ? "#06111D" : theme.text, fontWeight: "800" }}>
              {chip}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
