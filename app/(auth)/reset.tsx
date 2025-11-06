import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AuthContainer from "src/components/AuthContainer";
import GlassCard from "src/components/ui/GlassCard";
import { supabase } from "src/lib/supabase";
import { useThemeMode } from "src/theme/ThemeModeProvider";

function parseFromUrl(url: string | null) {
  if (!url) return {} as any;
  const [beforeHash, afterHash] = url.split('#');
  const [beforeQuery,] = beforeHash.split('?');
  const queryString = url.includes('?') ? url.slice(url.indexOf('?') + 1, url.includes('#') ? url.indexOf('#') : undefined) : '';
  const fragmentString = afterHash || '';

  const qp = new URLSearchParams(queryString);
  const fp = new URLSearchParams(fragmentString);

  const get = (k: string) => fp.get(k) || qp.get(k) || undefined;

  const access_token = get('access_token');
  const refresh_token = get('refresh_token');
  const code = get('code');
  const type = get('type');
  const error_code = get('error_code');
  const error_description = get('error_description');

  return { access_token, refresh_token, code, type, error_code, error_description } as {
    access_token?: string;
    refresh_token?: string;
    code?: string;
    type?: string;
    error_code?: string;
    error_description?: string;
  };
}

export default function ResetPasswordScreen() {
  const { colors, isDark } = useThemeMode();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [tokens, setTokens] = useState<{ access_token?: string; refresh_token?: string; code?: string; type?: string; error_code?: string; error_description?: string }>({});
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState("")

  // Capture initial URL and live events (if app is running when link is clicked)
  useEffect(() => {
    let mounted = true;

    const readInitial = async () => {
      const initial = await Linking.getInitialURL();
      if (!mounted) return;
      const parsed = parseFromUrl(initial);
      if (parsed.access_token && parsed.refresh_token) {
        setTokens(parsed);
      } else if (parsed.code) {
        setTokens(parsed);
      }
      setChecking(false);
    };

    const sub = Linking.addEventListener("url", ({ url }) => {
      const parsed = parseFromUrl(url);
      if (parsed.access_token && parsed.refresh_token) {
        setTokens(parsed);
      } else if (parsed.code) {
        setTokens(parsed);
      }
    });

    readInitial();
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const hasTokens = useMemo(() => (!!tokens.access_token && !!tokens.refresh_token) || !!tokens.code, [tokens]);

  async function onApply() {
    if (!hasTokens) {
      setErr("Invalid or missing reset link. Re-open the email link on this device.");
      return;
    }
    if (!password || password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== password2) {
      setErr("Passwords do not match.");
      return;
    }

    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      if (tokens.access_token && tokens.refresh_token) {
        // Establish a session from the deep link tokens
        const { error: setErrRes } = await supabase.auth.setSession({
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token!,
        });
        if (setErrRes) throw setErrRes;
      } else if (tokens.code) {
        // Some clients deliver a code instead of tokens
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(tokens.code);
        if (exchErr) throw exchErr;
      } else {
        throw new Error('Missing credentials from reset link.');
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setNotice("Password updated. You can sign in now.");
      // Small delay to let the message render
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 400);
    } catch (e: any) {
      const m = (e?.message as string) || "Unable to update password.";
      setErr(m);
      if (__DEV__) console.log("[auth] reset apply error:", e);
    } finally {
      setBusy(false);
    }
  }

  function onUsePastedLink() {
    setErr(null); setNotice(null);
    const parsed = parseFromUrl(pastedUrl.trim());
    if (parsed.access_token && parsed.refresh_token) {
      setTokens(parsed);
      setNotice("Link recognized. You can now update your password.");
    } else if (parsed.code) {
      setTokens(parsed);
      setNotice("Link recognized. You can now update your password.");
    } else {
      setErr("That link doesn't include reset credentials. Make sure you pasted the full URL from the email.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <AuthContainer>
        <View style={{ width: "100%", maxWidth: 640, paddingHorizontal: 16 }}>
          <Text style={[styles.title, { color: colors.text }]}>Reset password</Text>

          <GlassCard style={{ marginTop: 16 }}>
            <View style={{ padding: 16, gap: 12 }}>
              {checking ? (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <ActivityIndicator />
                </View>
              ) : hasTokens ? (
                <>
                  <Text style={{ color: colors.text, opacity: 0.75, fontSize: 13 }}>
                    Enter a new password for your account.
                  </Text>
                  <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry colors={colors} isDark={isDark} />
                  <Field label="Confirm password" value={password2} onChangeText={setPassword2} secureTextEntry colors={colors} isDark={isDark} />

                  {!!err && <Text style={styles.errText}>{err}</Text>}
                  {!!notice && <Text style={styles.okText}>{notice}</Text>}

                  <Pressable
                    onPress={onApply}
                    disabled={busy}
                    style={[styles.primaryBtn, { backgroundColor: colors.card, borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)", opacity: busy ? 0.7 : 1 }]}
                  >
                    {busy ? <ActivityIndicator /> : <Text style={[styles.primaryBtnText, { color: colors.text }]}>Update password</Text>}
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={{ color: colors.text }}>
                    Invalid or expired reset link. Try the steps below:
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.75, fontSize: 13 }}>
                    • Open the latest reset email on this device and tap the link.
                    {"\n"}• Or copy the full link from the email and paste it here:
                  </Text>

                  <Field label="Paste reset link" value={pastedUrl} onChangeText={setPastedUrl} colors={colors} isDark={isDark} autoCapitalize="none" />
                  {!!err && <Text style={styles.errText}>{err}</Text>}
                  {!!notice && <Text style={styles.okText}>{notice}</Text>}

                  <Pressable
                    onPress={onUsePastedLink}
                    style={[styles.primaryBtn, { backgroundColor: colors.card, borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)" }]}
                  >
                    <Text style={[styles.primaryBtnText, { color: colors.text }]}>Use pasted link</Text>
                  </Pressable>
                </>
              )}
            </View>
          </GlassCard>
        </View>
      </AuthContainer>
    </KeyboardAvoidingView>
  );
}

function Field({ label, colors, isDark, ...rest }: any) {
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
  title: { fontSize: 22, fontWeight: "800" },
  primaryBtn: {
    marginTop: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700" },
  errText: { color: "#ff6b6b", fontSize: 13, alignSelf: "center" },
  okText: { color: "#2ecc71", fontSize: 13, alignSelf: "center" },
});
