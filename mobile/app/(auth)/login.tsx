import { Link, router } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { AuthField, AuthPrimaryButton, AuthScreen, GoogleButton } from "@/components/auth-screen";
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
    <AuthScreen title="Entrar" subtitle="Compre & Ganhe 013">
      <View style={{ gap: 14 }}>
        <AuthField
          icon={<Mail color={theme.accent} size={19} strokeWidth={2.3} />}
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address"
          placeholder="E-mail ou telefone"
        />
        <AuthField
          icon={<LockKeyhole color={theme.accent} size={19} strokeWidth={2.3} />}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Senha"
        />
      </View>

      {error ? (
        <Text selectable style={{ color: theme.danger, fontWeight: "800", textAlign: "center", marginTop: -14 }}>
          {error}
        </Text>
      ) : null}

      <View style={{ gap: 12 }}>
        <AuthPrimaryButton label="Entrar" loadingLabel="Entrando..." loading={loading} onPress={handleLogin} />
        <GoogleButton label="Entrar com Google" onPress={handleGoogle} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/(auth)/register" asChild>
          <Pressable hitSlop={10}>
            <Text selectable style={{ color: theme.accent, fontSize: 14, fontWeight: "900" }}>
              Criar conta
            </Text>
          </Pressable>
        </Link>

        <Pressable hitSlop={10}>
          <Text selectable style={{ color: theme.accent, fontSize: 14, fontWeight: "900" }}>
            Recuperar senha
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
