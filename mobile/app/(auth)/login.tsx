import { Link, router } from "expo-router";
import { Mail, Sparkles } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { useAuth } from "@/context/auth-context";
import { useAppTheme } from "@/theme/colors";

export default function LoginScreen() {
  const theme = useAppTheme();
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [identifier, setIdentifier] = React.useState("gustavo@email.com");
  const [password, setPassword] = React.useState("123456");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel entrar com Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 24, gap: 22, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: theme.muted, fontSize: 16 }}>
            Compre & Ganhe 013
          </Text>
          <Text selectable style={{ color: theme.text, fontSize: 34, fontWeight: "800" }}>
            Entrar
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Pressable
            onPress={handleGoogle}
            style={{
              minHeight: 54,
              borderRadius: 16,
              backgroundColor: theme.accent,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Sparkles color="#06111D" size={20} strokeWidth={2.5} />
            <Text selectable style={{ color: "#06111D", fontWeight: "800", fontSize: 16 }}>
              Entrar com Google
            </Text>
          </Pressable>

          <View style={{ gap: 10 }}>
            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: theme.muted, fontWeight: "700" }}>
                E-mail ou telefone
              </Text>
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="gustavo@email.com"
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
            </View>

            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: theme.muted, fontWeight: "700" }}>
                Senha
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="123456"
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
            </View>
          </View>

          {error ? (
            <Text selectable style={{ color: theme.danger, fontWeight: "700" }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={handleLogin}
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
            <Mail color="#FFFFFF" size={20} strokeWidth={2.4} />
            <Text selectable style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </Pressable>

          <Link href="/(auth)/register" asChild>
            <Pressable style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}>
              <Text selectable style={{ color: theme.text, fontWeight: "700" }}>
                Criar conta
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </AppBackground>
  );
}
