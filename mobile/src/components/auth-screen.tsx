import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/colors";

const brandIcon = require("../../assets/icon.png");

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

type AuthFieldProps = {
  icon: React.ReactNode;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numbers-and-punctuation";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  const theme = useAppTheme();
  const background = theme.dark ? theme.gradient : ["#FFFFFF", "#FFFFFF", "#FFFFFF"];

  return (
    <LinearGradient colors={background as [string, string, string]} style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: 34,
            paddingBottom: 34,
            justifyContent: "center",
          }}
        >
          <View style={{ gap: 30 }}>
            <View style={{ alignItems: "center", gap: 14 }}>
              <View
                style={{
                  width: 124,
                  height: 124,
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.dark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: theme.dark ? "rgba(255,255,255,0.13)" : "#EEF2F7",
                  shadowColor: theme.dark ? "#35E481" : "#06234F",
                  shadowOpacity: theme.dark ? 0.2 : 0.1,
                  shadowRadius: 22,
                  shadowOffset: { width: 0, height: 12 },
                  elevation: 8,
                }}
              >
                <Image source={brandIcon} style={{ width: 104, height: 104, borderRadius: 26 }} contentFit="cover" />
              </View>

              <View style={{ alignItems: "center", gap: 5 }}>
                <Text selectable style={{ color: theme.text, fontSize: 32, fontWeight: "900", textAlign: "center" }}>
                  {title}
                </Text>
                <Text selectable style={{ color: theme.muted, fontSize: 14, fontWeight: "700", textAlign: "center" }}>
                  {subtitle}
                </Text>
              </View>
            </View>

            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export function AuthField({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
}: AuthFieldProps) {
  const theme = useAppTheme();
  const [hidden, setHidden] = React.useState(secureTextEntry);

  return (
    <View
      style={{
        minHeight: 56,
        borderRadius: 17,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
        borderWidth: 1,
        borderColor: theme.dark ? "rgba(53,228,129,0.34)" : "#DDE5F2",
      }}
    >
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        secureTextEntry={hidden}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={false}
        numberOfLines={1}
        style={{
          flex: 1,
          height: 54,
          minWidth: 0,
          color: theme.text,
          fontSize: 16,
          paddingVertical: 0,
          textAlignVertical: "center",
        }}
      />
      {secureTextEntry ? (
        <Pressable onPress={() => setHidden((current) => !current)} hitSlop={10}>
          {hidden ? <Eye color={theme.muted} size={20} strokeWidth={2.3} /> : <EyeOff color={theme.muted} size={20} strokeWidth={2.3} />}
        </Pressable>
      ) : null}
    </View>
  );
}

export function AuthPrimaryButton({ label, loadingLabel, loading, onPress }: { label: string; loadingLabel: string; loading?: boolean; onPress: () => void }) {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} disabled={loading} style={{ opacity: loading ? 0.76 : 1 }}>
      <LinearGradient
        colors={theme.dark ? ["#35E481", "#20C970"] : ["#06234F", "#0B3675"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          minHeight: 56,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: theme.dark ? "#35E481" : "#06234F",
          shadowOpacity: 0.24,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        }}
      >
        <Text selectable style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900" }}>
          {loading ? loadingLabel : label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GoogleButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 54,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        backgroundColor: theme.dark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
        borderWidth: 1,
        borderColor: theme.dark ? "rgba(255,255,255,0.20)" : "#DDE5F2",
      }}
    >
      <Text selectable style={{ color: "#4285F4", fontSize: 19, fontWeight: "900" }}>
        G
      </Text>
      <Text selectable style={{ color: theme.text, fontSize: 15, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}
