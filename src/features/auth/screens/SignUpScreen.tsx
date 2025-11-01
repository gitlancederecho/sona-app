// src/features/auth/screens/SignUpScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { useAuth } from "src/providers/AuthProvider";

export default function SignUpScreen() {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    const { error } = await signUpWithEmail(email.trim(), password);
    if (error) Alert.alert("Sign up failed", error);
    else {
      Alert.alert("Check your inbox", "We sent a confirmation link if email confirmations are on.");
      router.replace("/(tabs)");
    }
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Create account</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <Button title="Sign up" onPress={onSubmit} />
    </View>
  );
}
