// src/features/profile/screens/ProfileScreen.tsx
import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlassCard from "src/components/ui/GlassCard";
import HeroProfile from "src/features/profile/components/HeroProfile";
import { supabase } from "src/lib/supabase";
import { useAuth } from "src/providers/AuthProvider";
import { useThemeMode } from "src/theme/ThemeModeProvider";

function ProfileTopBar({ handle }: { handle: string }) {
  const { colors } = useThemeMode();
  return (
    <View
      style={{
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
      }}
    >
      {/* left */}
      <View style={{ width: 48, alignItems: "flex-start" }}>
        {/* add icon placeholder */}
        <Text style={{ fontSize: 24, opacity: 0.85, color: colors.text }}>＋</Text>
      </View>

      {/* center */}
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{handle}</Text>
      </View>

      {/* right */}
      <View style={{ width: 48, flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        {/* inbox + menu placeholders */}
        <Text style={{ fontSize: 18, opacity: 0.85, color: colors.text }}>◎</Text>
        <Text style={{ fontSize: 18, opacity: 0.85, color: colors.text }}>≡</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const [displayName, setDisplayName] = useState("");
  const [displayBio, setDisplayBio] = useState("");
  const [displayHandle, setDisplayHandle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const userModel = user ? {
    id: user.id,
    name: displayName,
    handle: displayHandle || undefined,
    avatar_url: avatarUrl,
    followers: 0,
    following: 0,
    moments: 0,
    bio: displayBio,
  } : null;

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .select('name, bio, avatar_url, handle')
      .eq('id', user.id)
      .maybeSingle();
    if (error) return;
    setDisplayName(data?.name || '');
    setDisplayBio(data?.bio || '');
    setDisplayHandle(data?.handle || '');
    setAvatarUrl(data?.avatar_url || null);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // No inline editing logic here anymore.

  // Avatar modification moved to EditProfileScreen.

  // If user is null (signed out) avoid rendering and let navigation logic elsewhere redirect.
  if (!user) return null;

  const MAX_W = 640;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", maxWidth: 640 }}>
          <ProfileTopBar handle={displayHandle || "username"} />
        </View>

        {userModel && <HeroProfile user={userModel} />}

        <View style={{ width: "100%", maxWidth: 640, paddingHorizontal: 16, marginTop: 12 }}>
          <GlassCard sheen>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Your dashboard</Text>
              <Text style={{ marginTop: 4, opacity: 0.7, color: colors.text }}>Audience insights, inspiration and tools.</Text>
            </View>
          </GlassCard>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <GlassCard style={{ flex: 1 }}>
              <Link href="/(tabs)/edit-profile" asChild>
                <Pressable style={{ paddingVertical: 14, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>Edit profile</Text>
                </Pressable>
              </Link>
            </GlassCard>
            <GlassCard style={{ flex: 1 }}>
              <View style={{ paddingVertical: 14, alignItems: "center" }}>
                <Text style={{ fontWeight: "600", color: colors.text }}>Share profile</Text>
              </View>
            </GlassCard>
            <GlassCard>
              <View style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 18, color: colors.text }}>＋</Text>
              </View>
            </GlassCard>
          </View>
        </View>


        {/* Editing moved to EditProfileScreen; keep page lean */}
      </ScrollView>
    </SafeAreaView>
  );
}
