import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "src/providers/AuthProvider";
import { ThemeModeProvider } from "../src/theme/ThemeModeProvider";

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeModeProvider>
  );
}
