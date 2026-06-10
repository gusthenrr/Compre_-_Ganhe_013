import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { useAuth } from "@/context/auth-context";
import { useAppTheme } from "@/theme/colors";

export default function CompleteProfileScreen() {
  const theme = useAppTheme();
  const { isAuthenticated, register } = useAuth();
  const params = useLocalSearchParams<{ identifier?: string; password?: string }>();
  const [name, setName] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  async function finish() {
    setError("");
    if (!name.trim() || !birthDate.trim()) {
      setError("Informe nome e data de nascimento.");
      return;
    }
    setLoading(true);
    try {
      await register({
        identifier: params.identifier ?? "",
        password: params.password ?? "",
        name,
        birth_date: birthDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 24, gap: 22, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: theme.muted, fontSize: 16 }}>
            Segunda etapa
          </Text>
          <Text selectable style={{ color: theme.text, fontSize: 32, fontWeight: "800" }}>
            Complete seu cadastro
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome"
            placeholderTextColor={theme.placeholder}
            style={{
              minHeight: 52,
              borderRadius: 16,
              paddingHorizontal: 16,
              color: theme.text,
              backgroundColor: theme.input,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          />
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numbers-and-punctuation"
            placeholder="Data de nascimento"
            placeholderTextColor={theme.placeholder}
            style={{
              minHeight: 52,
              borderRadius: 16,
              paddingHorizontal: 16,
              color: theme.text,
              backgroundColor: theme.input,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          />

          {error ? (
            <Text selectable style={{ color: theme.danger, fontWeight: "700" }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={finish}
            disabled={loading}
            style={{
              minHeight: 54,
              borderRadius: 16,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
              opacity: loading ? 0.75 : 1,
            }}
          >
            <Check color="#FFFFFF" size={20} strokeWidth={2.5} />
            <Text selectable style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
              {loading ? "Finalizando..." : "Finalizar cadastro"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppBackground>
  );
}
