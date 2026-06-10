import { router } from "expo-router";
import { ArrowRight, Sparkles } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { useAuth } from "@/context/auth-context";
import { useAppTheme } from "@/theme/colors";

export default function RegisterScreen() {
  const theme = useAppTheme();
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  function continueRegister() {
    setError("");
    if (!identifier.trim() || password.length < 6) {
      setError("Informe email/telefone e uma senha com pelo menos 6 caracteres.");
      return;
    }
    router.push({ pathname: "/(auth)/complete-profile", params: { identifier, password } });
  }

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 24, gap: 22, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: theme.muted, fontSize: 16 }}>
            Primeira etapa
          </Text>
          <Text selectable style={{ color: theme.text, fontSize: 32, fontWeight: "800" }}>
            Criar conta
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="E-mail ou telefone"
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Senha"
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
            onPress={continueRegister}
            style={{
              minHeight: 54,
              borderRadius: 16,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Text selectable style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
              Continuar
            </Text>
            <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.5} />
          </Pressable>

          <Pressable
            onPress={loginWithGoogle}
            style={{
              minHeight: 52,
              borderRadius: 16,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Sparkles color={theme.accent} size={19} strokeWidth={2.5} />
            <Text selectable style={{ color: theme.text, fontWeight: "800" }}>
              Ou entre com Google
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppBackground>
  );
}
