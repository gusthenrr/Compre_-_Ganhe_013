import { router } from "expo-router";
import { KeyRound, LogOut, UserRound } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { changePasswordRequest } from "@/api/client";
import { AppBackground } from "@/components/app-background";
import { MetricCard } from "@/components/metric-card";
import { useAuth } from "@/context/auth-context";
import { useAppTheme } from "@/theme/colors";
import { formatBirthDate, formatMoney } from "@/utils/format";

export default function AccountScreen() {
  const theme = useAppTheme();
  const { user, token, logout } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [message, setMessage] = React.useState("");

  async function handlePasswordChange() {
    setMessage("");
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      setMessage("Confira a nova senha e a confirmacao.");
      return;
    }
    if (token && token !== "demo-token") {
      await changePasswordRequest(token, currentPassword, newPassword);
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Senha atualizada.");
  }

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <AppBackground>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingBottom: 112, gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.primary,
            }}
          >
            <UserRound color="#FFFFFF" size={28} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text selectable style={{ color: theme.text, fontSize: 26, fontWeight: "900" }} numberOfLines={1}>
              {user?.name ?? "Gustavo"}
            </Text>
            <Text selectable style={{ color: theme.muted, fontWeight: "700" }} numberOfLines={1}>
              {user?.identifier ?? user?.email ?? user?.phone}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <MetricCard label="Visitados" value={`${user?.visited_count ?? 0}`} />
          <MetricCard label="Economia" value={formatMoney(user?.total_saved ?? 0)} />
          <MetricCard label="Restantes" value={`${user?.remaining_promotions ?? 10}`} />
        </View>

        <View style={{ padding: 16, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, gap: 10 }}>
          <Text selectable style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>
            Dados da conta
          </Text>
          <Text selectable style={{ color: theme.muted, fontWeight: "700" }}>
            Nome: {user?.name}
          </Text>
          <Text selectable style={{ color: theme.muted, fontWeight: "700" }}>
            E-mail/telefone: {user?.identifier ?? user?.email ?? user?.phone}
          </Text>
          <Text selectable style={{ color: theme.muted, fontWeight: "700" }}>
            Data de nascimento: {formatBirthDate(user?.birth_date)}
          </Text>
        </View>

        <View style={{ padding: 16, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, gap: 12 }}>
          <Pressable onPress={() => setShowPassword((value) => !value)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <KeyRound color={theme.accent} size={22} strokeWidth={2.5} />
            <Text selectable style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>
              Trocar senha
            </Text>
          </Pressable>

          {showPassword ? (
            <View style={{ gap: 10 }}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Senha atual"
                placeholderTextColor={theme.placeholder}
                style={{ minHeight: 48, borderRadius: 14, paddingHorizontal: 14, color: theme.text, backgroundColor: theme.input }}
              />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Nova senha"
                placeholderTextColor={theme.placeholder}
                style={{ minHeight: 48, borderRadius: 14, paddingHorizontal: 14, color: theme.text, backgroundColor: theme.input }}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirmar nova senha"
                placeholderTextColor={theme.placeholder}
                style={{ minHeight: 48, borderRadius: 14, paddingHorizontal: 14, color: theme.text, backgroundColor: theme.input }}
              />
              {message ? (
                <Text selectable style={{ color: message.includes("atualizada") ? theme.accent : theme.danger, fontWeight: "800" }}>
                  {message}
                </Text>
              ) : null}
              <Pressable
                onPress={handlePasswordChange}
                style={{ minHeight: 48, borderRadius: 14, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" }}
              >
                <Text selectable style={{ color: "#FFFFFF", fontWeight: "900" }}>
                  Salvar nova senha
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={handleLogout}
          style={{
            minHeight: 54,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <LogOut color={theme.danger} size={20} strokeWidth={2.5} />
          <Text selectable style={{ color: theme.danger, fontSize: 16, fontWeight: "900" }}>
            Sair da conta
          </Text>
        </Pressable>
      </ScrollView>
    </AppBackground>
  );
}
