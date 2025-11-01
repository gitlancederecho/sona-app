// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "src/providers/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
