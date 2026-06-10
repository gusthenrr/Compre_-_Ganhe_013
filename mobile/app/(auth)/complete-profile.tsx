import { router, useLocalSearchParams } from "expo-router";
import { CalendarDays, UserRound } from "lucide-react-native";
import * as React from "react";
import { Text, View } from "react-native";

import { AuthField, AuthPrimaryButton, AuthScreen } from "@/components/auth-screen";
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
    <AuthScreen title="Seu perfil" subtitle="Compre & Ganhe 013">
      <View style={{ gap: 14 }}>
        <AuthField
          icon={<UserRound color={theme.accent} size={19} strokeWidth={2.3} />}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder="Nome"
        />
        <AuthField
          icon={<CalendarDays color={theme.accent} size={19} strokeWidth={2.3} />}
          value={birthDate}
          onChangeText={setBirthDate}
          keyboardType="numbers-and-punctuation"
          placeholder="Data de nascimento"
        />
      </View>

      {error ? (
        <Text selectable style={{ color: theme.danger, fontWeight: "800", textAlign: "center", marginTop: -14 }}>
          {error}
        </Text>
      ) : null}

      <AuthPrimaryButton label="Finalizar cadastro" loadingLabel="Finalizando..." loading={loading} onPress={finish} />
    </AuthScreen>
  );
}
