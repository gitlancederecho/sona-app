import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#111111' }
      }}
    >
      {/* tabs navigator */}
      <Stack.Screen name="(tabs)" />
      {/* modal route (kept for now) */}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
