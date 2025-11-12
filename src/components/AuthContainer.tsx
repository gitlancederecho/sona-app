// src/components/AuthContainer.tsx
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeMode } from "src/theme/ThemeModeProvider";

type Props = { children: React.ReactNode };

export default function AuthContainer({ children }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeMode();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: Math.max(24, insets.top),
            paddingBottom: Math.max(24, insets.bottom),
            justifyContent: "center",
          }}
        >
          <View style={{ gap: 12 }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
