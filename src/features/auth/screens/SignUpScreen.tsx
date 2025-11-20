// src/features/auth/screens/SignUpScreen.tsx
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import AuthContainer from "src/components/AuthContainer";
import { supabase } from "src/lib/supabase";
import { useAuth } from "src/providers/AuthProvider";

export default function SignUpScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();

  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // optional
  const [loading, setLoading] = useState(false);

  const isHandleValid = useMemo(() => {
    const v = handle.trim().toLowerCase();
    if (v.length < 3 || v.length > 30) return false;
    if (!/^[a-z0-9_]+$/.test(v)) return false;
    if (/__+/.test(v)) return false;
    if (/^_|_$/.test(v)) return false;
    return true;
  }, [handle]);

  async function onSubmit() {
    if (!isHandleValid) {
      Alert.alert("Invalid username", "3–30 chars; a–z, 0–9, underscores (no double/edge underscores).");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Please use at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await supabase.functions.invoke("username-signup", {
        body: { handle: handle.trim().toLowerCase(), password, email: email.trim() || null },
      });
      if (res.error) {
        // Extract server-provided JSON error if present
        let serverMsg = res.error.message;
        const bodyAny: any = (res as any).data ?? (res.error as any)?.context?.body;
        if (bodyAny) {
          try {
            const parsed = typeof bodyAny === 'string' ? JSON.parse(bodyAny) : bodyAny;
            if (parsed?.error) serverMsg = parsed.error;
          } catch {
            // ignore JSON parse errors
          }
        }
        throw new Error(serverMsg);
      }
      const data: any = res.data;
      if (!data?.email_used) {
        throw new Error("Signup did not return email.");
      }

      // Immediately sign in using the email_used + password
      const { error: signInErr } = await signInWithEmail(data.email_used, password);
      if (signInErr) {
        throw new Error(signInErr.message);
      }
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg = (e?.message || "Unable to sign up right now.").toString();
      const m = msg.toLowerCase();
      if (m.includes("handle already taken") || m.includes("duplicate key value") || m.includes("unique constraint")) {
        Alert.alert("Username taken", "Please choose another username.");
      } else if (m.includes("service_role") || m.includes("service role") || m.includes("not authorized") || m.includes("jwt") || m.includes("401") || m.includes("403")) {
        Alert.alert("Server not configured", "Signup service not configured. Please deploy and set service role key.");
      } else {
        Alert.alert("Sign up failed", msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContainer>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Create account</Text>

      <View style={{ gap: 10, width: "100%" }}>
        <TextInput
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          value={handle}
          onChangeText={setHandle}
          style={{ borderWidth: 1, borderColor: isHandleValid ? "#222" : "#c33", padding: 12, borderRadius: 10 }}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ borderWidth: 1, borderColor: "#222", padding: 12, borderRadius: 10 }}
        />

        <TextInput
          placeholder="Email (optional)"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ borderWidth: 1, borderColor: "#222", padding: 12, borderRadius: 10 }}
        />

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={{ marginTop: 8, alignSelf: "center", paddingVertical: 10, paddingHorizontal: 16, opacity: loading ? 0.7 : 1 }}
        >
          <Text style={{ fontSize: 18 }}>{loading ? "Creating…" : "Sign up"}</Text>
        </Pressable>
      </View>

      <Link href="/(auth)/sign-in" style={{ marginTop: 16, alignSelf: "center" }}>
        <Text>Already have an account? Sign in</Text>
      </Link>
    </AuthContainer>
  );
}
