import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";

import { useAppTheme } from "@/theme/colors";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChangeText, placeholder = "Buscar restaurantes, bairros ou promocoes" }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        minHeight: 52,
        borderRadius: 22,
        backgroundColor: theme.input,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Search color={theme.muted} size={22} strokeWidth={2.4} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        style={{ color: theme.text, flex: 1, fontSize: 16, minWidth: 0 }}
      />
    </View>
  );
}
