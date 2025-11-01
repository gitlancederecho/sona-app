// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Button, Text, View } from "react-native";
import { useAuth } from "src/providers/AuthProvider";

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/(auth)/sign-in");
  }, [user]);

  if (!user) return null;

  return (
    <View style={{ padding: 24 }}>
      <Text>Welcome, {user.email}</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}
