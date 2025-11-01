// src/features/auth/screens/SignUpScreen.tsx
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput } from "react-native";
import AuthContainer from "src/components/AuthContainer";
import { supabase } from "src/lib/supabase";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }

    // If email confirmations are enabled, session may be null until confirmed.
    const uid = data.user?.id;
    if (uid) {
      // Upsert profile row so the app has something to show immediately
      const { error: upsertError } = await supabase
        .from("users")
        .upsert({ id: uid, name: "", bio: "", avatar_url: null }, { onConflict: "id" });

      if (upsertError) {
        // Not fatal; profile edit can still create it later
        console.log("Profile upsert warning:", upsertError.message);
      }
    }

    Alert.alert("Check your email", "We sent a confirmation link if required.");
    router.replace("/(tabs)");
  }

  return (
    <AuthContainer>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Create account</Text>

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
        <Text style={{ fontSize: 18 }}>Sign up</Text>
      </Pressable>

      <Link href="/(auth)/sign-in" style={{ marginTop: 16, alignSelf: "center" }}>
        <Text>Already have an account? Sign in</Text>
      </Link>
    </AuthContainer>
  );
}
