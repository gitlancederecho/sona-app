// src/features/auth/screens/SignInScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";
import AuthContainer from "src/components/AuthContainer";
import { useAuth } from "src/providers/AuthProvider";

export default function SignInScreen() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    const { error } = await signInWithEmail(email.trim(), password);
    if (!error) router.replace("/(tabs)");
    // add an Alert if you want to show failures
  }

  return (
    <AuthContainer>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Sign in</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: "#222", padding: 12, borderRadius: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: "#222", padding: 12, borderRadius: 10 }}
      />

      <Pressable
        onPress={onSubmit}
        style={{ marginTop: 8, alignSelf: "center", paddingVertical: 10, paddingHorizontal: 16 }}
      >
        <Text style={{ fontSize: 18 }}>Sign in</Text>
      </Pressable>
    </AuthContainer>
  );
}
