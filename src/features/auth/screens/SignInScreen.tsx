// src/features/auth/screens/SignInScreen.tsx
import AuthContainer from "@/src/components/AuthContainer";
import GlassCard from "@/src/components/ui/GlassCard";
import { useAuth } from "@/src/providers/AuthProvider";
import { useThemeMode } from "@/src/theme/ThemeModeProvider";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_W = 640;
const H_PAD = 16;

export default function SignInScreen() {
  const { colors, isDark } = useThemeMode();
  const { signInWithEmail, resetPassword } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit() {
    if (!email.trim() || !password) {
      setErr("Email and password required");
      return;
    }
    setErr(null);
  setNotice(null);
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email.trim(), password);
      setLoading(false);
      if (!error) {
        router.replace("/(tabs)");
      } else {
        // Surface a friendlier message for common cases
        const msg = normalizeAuthError(error.message);
        setErr(msg);
        if (__DEV__) console.log("[auth] sign-in error:", error);
      }
    } catch (e: any) {
      setLoading(false);
      // Network or unexpected error
      const fallback = e?.message?.includes("Network request failed")
        ? "Network error. Check your connection and try again."
        : "Unable to sign in right now. Please try again.";
      setErr(fallback);
      if (__DEV__) console.log("[auth] sign-in exception:", e);
    }
  }

  async function onForgotPassword() {
    if (!email.trim()) {
      setErr("Enter your email above first");
      return;
    }
    setErr(null);
    setNotice(null);
    const { error } = await resetPassword(email.trim());
    if (error) {
      setErr(normalizeAuthError(error.message));
      if (__DEV__) console.log("[auth] reset password error:", error);
    } else {
      setNotice("Password reset email sent. Check your inbox.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.root, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 10) + 20 }]}
    >
      {/* soft ambient light so the glass reads */}
      <View style={styles.ambientWrap} pointerEvents="none">
        <View
          style={[
            styles.ambientBlob,
            { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
          ]}
        />
        <View
          style={[
            styles.ambientBlobSm,
            { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" },
          ]}
        />
      </View>

      <AuthContainer>
        <View style={{ width: "100%", maxWidth: MAX_W, paddingHorizontal: H_PAD }}>
          <Text style={[styles.brand, { color: colors.text }]}>SONA</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>Sign in</Text>

          <GlassCard style={{ marginTop: 16 }}>
            <View style={{ padding: 16, gap: 12 }}>
              <GlassInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                colors={colors}
                isDark={isDark}
              />
              <GlassInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                colors={colors}
                isDark={isDark}
              />

              {!!err && <Text style={styles.errText}>{err}</Text>}
              {!!notice && <Text style={styles.noticeText}>{notice}</Text>}

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
                  <Text style={[styles.primaryBtnText, { color: colors.text }]}>Sign in</Text>
                )}
              </Pressable>

              <Pressable style={{ alignSelf: "center", paddingVertical: 6 }} onPress={onForgotPassword}>
                <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13 }}>Forgot password?</Text>
              </Pressable>
            </View>
          </GlassCard>

          <View style={{ marginTop: 12, alignItems: "center", gap: 10 }}>
            <GlassCard>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>Create account</Text>
                </Pressable>
              </Link>
            </GlassCard>
          </View>
        </View>
      </AuthContainer>
    </KeyboardAvoidingView>
  );
}

function normalizeAuthError(message: string | undefined) {
  if (!message) return "Sign in failed";
  const m = message.toLowerCase();
  if (m.includes("email not confirmed") || m.includes("confirm your email")) {
    return "Please confirm your email first. Check your inbox for the verification link.";
  }
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "Invalid email or password.";
  }
  if (m.includes("over quota") || m.includes("rate limit")) {
    return "Service is busy. Please wait a moment and try again.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  return message;
}

function GlassInput({
  label,
  colors,
  isDark,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  colors: any;
  isDark: boolean;
}) {
  const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const border = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)";
  return (
    <View style={{ gap: 6 }}>
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
  root: { flex: 1 },
  ambientWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  ambientBlob: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 280,
    filter: "blur(30px)" as any,
  },
  ambientBlobSm: {
    position: "absolute",
    bottom: -40,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 200,
    filter: "blur(22px)" as any,
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
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
  errText: {
    color: "#ff6b6b",
    fontSize: 13,
    alignSelf: "center",
  },
  noticeText: {
    color: "#2ecc71",
    fontSize: 13,
    alignSelf: "center",
  },
});
