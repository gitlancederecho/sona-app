// src/features/auth/screens/SignUpScreen.tsx
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AuthContainer from "src/components/AuthContainer";
import GlassCard from "src/components/ui/GlassCard";
import { supabase } from "src/lib/supabase";
import { useAuth } from "src/providers/AuthProvider";
import { useThemeMode } from "src/theme/ThemeModeProvider";
import { spacing } from "src/theme/tokens";

export default function SignUpScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const { colors, isDark } = useThemeMode();

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
      <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>Create account</Text>

      <GlassCard style={{ width: "100%", marginTop: spacing.md }} padding={spacing.md} sheen>
        <View style={{ gap: spacing.md }}>
          <LabeledInput
            label="Username"
            value={handle}
            onChangeText={setHandle}
            placeholder="yourhandle"
            autoCapitalize="none"
            autoCorrect={false}
            isDark={isDark}
            colors={colors}
            borderColorOverride={isHandleValid ? undefined : "#c33"}
          />

          <LabeledInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            isDark={isDark}
            colors={colors}
          />

          <LabeledInput
            label="Email (optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            isDark={isDark}
            colors={colors}
          />

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)",
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={[styles.primaryBtnText, { color: colors.text }]}>Sign up</Text>
            )}
          </Pressable>
        </View>
      </GlassCard>

      <Link href="/(auth)/sign-in" style={{ marginTop: spacing.md, alignSelf: "center" }}>
        <Text style={{ color: colors.text, opacity: 0.8 }}>Already have an account? Sign in</Text>
      </Link>
    </AuthContainer>
  );
}

function LabeledInput({ label, colors, isDark, borderColorOverride, ...rest }: any) {
  const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const border = borderColorOverride ?? (isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)");
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ color: colors.text, opacity: 0.8, fontSize: 13 }}>{label}</Text>
      <View style={{ backgroundColor: bg, borderColor: border, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14 }}>
        <TextInput
          placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)"}
          style={{ color: colors.text, paddingVertical: 12, paddingHorizontal: 14, fontSize: 16 }}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    marginTop: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
