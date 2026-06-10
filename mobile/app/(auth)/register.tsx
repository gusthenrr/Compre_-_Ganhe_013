import { Link, router } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { AuthField, AuthPrimaryButton, AuthScreen, GoogleButton } from "@/components/auth-screen";
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
    <AuthScreen title="Criar conta" subtitle="Compre & Ganhe 013">
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
        <AuthPrimaryButton label="Continuar" loadingLabel="Continuando..." onPress={continueRegister} />
        <GoogleButton label="Entrar com Google" onPress={loginWithGoogle} />
      </View>

      <Link href="/(auth)/login" asChild>
        <Pressable style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}>
          <Text selectable style={{ color: theme.accent, fontSize: 14, fontWeight: "900" }}>
            Já tenho conta
          </Text>
        </Pressable>
      </Link>
    </AuthScreen>
  );
}
