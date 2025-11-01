// src/providers/AuthProvider.tsx
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "src/lib/supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Load any persisted session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

    useEffect(() => {
    async function ensureProfile() {
        const uid = session?.user?.id;
        if (!uid) return;

        const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", uid)
        .maybeSingle();

        if (!error && !data) {
        await supabase.from("users").insert({ id: uid, name: "", bio: "", avatar_url: null });
        }
    }
    ensureProfile();
    }, [session]);


  const value = useMemo<AuthContextType>(() => ({
    session,
    user: session?.user ?? null,
    async signInWithEmail(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    async signUpWithEmail(email, password) {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  }), [session]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
