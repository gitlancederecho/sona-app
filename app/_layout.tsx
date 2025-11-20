import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "src/providers/AuthProvider";
import { ThemeModeProvider, useThemeMode } from "../src/theme/ThemeModeProvider";

function ThemedRoot({ children }: { children: React.ReactNode }) {
  const { AmbientCrossfade } = useThemeMode();
  return <AmbientCrossfade>{children}</AmbientCrossfade>;
}

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <ThemedRoot>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </ThemedRoot>
    </ThemeModeProvider>
  );
}
