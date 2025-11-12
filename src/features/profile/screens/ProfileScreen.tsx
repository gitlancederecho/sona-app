// src/features/profile/screens/ProfileScreen.tsx
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
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
  const { colors, isDark } = useThemeMode(); // <- theme colors

  // profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // track initial values so Save disables when nothing changed
  const [initialName, setInitialName] = useState("");
  const [initialBio, setInitialBio] = useState("");

  // avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);

  // ui state
  const [isLoading, setIsLoading] = useState(false); // avatar ops
  const [isSaving, setIsSaving] = useState(false);   // profile save

  // micro-delay so the spinner is visible even on fast responses
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const MIN_SPINNER_MS = 450;

  const userModel = {
    id: user!.id,
    name,
    handle: name ? name.toLowerCase().replace(/\s+/g, "") : undefined,
    avatar_url: avatarUrl,
    followers: 0,
    following: 0,
    moments: 0,
    bio,
  };

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      const { data, error } = await supabase
        .from("users")
        .select("name, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!active || error) return;

      const n = data?.name ?? "";
      const b = data?.bio ?? "";

      setName(n);
      setBio(b);
      setInitialName(n);
      setInitialBio(b);
      setAvatarUrl(data?.avatar_url ?? null);
    }
    load();
    return () => {
      active = false;
    };
  }, [user]);

  const hasChanges = name !== initialName || bio !== initialBio;

  async function onSave() {
    if (!user || isSaving || !hasChanges) return;
    setIsSaving(true);

    const started = Date.now();
    const { error } = await supabase.from("users").update({ name, bio }).eq("id", user.id);

    const elapsed = Date.now() - started;
    if (elapsed < MIN_SPINNER_MS) await wait(MIN_SPINNER_MS - elapsed);
    setIsSaving(false);

    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }

    // lock Save again until something changes
    setInitialName(name);
    setInitialBio(bio);
  }

  async function onPickAvatar() {
    if (isLoading || !user) return;
    setIsLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Photo access is required to change your avatar.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        aspect: [1, 1],
      });
      if (res.canceled || !res.assets?.length) return;

      const asset = res.assets[0];
      let fileUri = asset.uri;

      try {
        const manipulated = await ImageManipulator.manipulateAsync(
          fileUri,
          [{ resize: { width: 512 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        fileUri = manipulated.uri;
      } catch (e) {
        console.warn("Image manipulate failed, using original:", e);
      }

      // get bytes from the local file (no blob in RN)
      let bytes: Uint8Array;
      try {
        const resp = await fetch(fileUri);
        const arrayBuffer = await resp.arrayBuffer();
        bytes = new Uint8Array(arrayBuffer);
      } catch (err) {
        console.error("File fetch failed:", err);
        Alert.alert(
          "File error",
          "Unable to access the selected image. Please pick another one from your library."
        );
        return;
      }

      const path = `${user.id}.jpg`;
      const contentType = asset.mimeType || "image/jpeg";

      // upload bytes to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, bytes, { upsert: true, contentType });

      if (uploadErr) {
        Alert.alert("Upload failed", uploadErr.message);
        return;
      }

      // get public URL
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      // save to profile
      const { error: updateErr } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateErr) {
        Alert.alert("Save failed", updateErr.message);
        return;
      }

      setAvatarUrl(publicUrl);
      setAvatarVersion((v) => v + 1);
      Alert.alert("Success", "Avatar updated!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function onRemoveAvatar() {
    if (!user) return;

    Alert.alert("Remove avatar", "Are you sure you want to remove your avatar?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            const path = `${user.id}.jpg`;

            // delete from Storage
            const { error: delErr } = await supabase.storage.from("avatars").remove([path]);
            if (delErr) {
              Alert.alert("Delete failed", delErr.message);
              return;
            }

            // clear avatar_url in users table
            const { error: updateErr } = await supabase
              .from("users")
              .update({ avatar_url: null })
              .eq("id", user.id);

            if (updateErr) {
              Alert.alert("Save failed", updateErr.message);
              return;
            }

            setAvatarUrl(null);
            setAvatarVersion((v) => v + 1);
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }

  if (!user) return null;

  const MAX_W = 640;
  const H_PAD = 20;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", maxWidth: 640 }}>
          <ProfileTopBar handle={user?.id ?? "username"} />
        </View>

        <HeroProfile user={userModel} />

        <View style={{ width: "100%", maxWidth: 640, paddingHorizontal: 16, marginTop: 10 }}>
          <GlassCard>
            <View style={{ padding: 14 }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>Your dashboard</Text>
              <Text style={{ marginTop: 2, opacity: 0.7, color: colors.text }}>Audience insights, inspiration and tools.</Text>
            </View>
          </GlassCard>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <GlassCard style={{ flex: 1 }}>
              <View style={{ paddingVertical: 12, alignItems: "center" }}>
                <Text style={{ fontWeight: "600", color: colors.text }}>Edit profile</Text>
              </View>
            </GlassCard>
            <GlassCard style={{ flex: 1 }}>
              <View style={{ paddingVertical: 12, alignItems: "center" }}>
                <Text style={{ fontWeight: "600", color: colors.text }}>Share profile</Text>
              </View>
            </GlassCard>
            <GlassCard>
              <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 18, color: colors.text }}>＋</Text>
              </View>
            </GlassCard>
          </View>
        </View>


        {/* Action zone below hero (we'll glass these in the next pass) */}
        <View style={{ width: "100%", maxWidth: MAX_W, paddingHorizontal: H_PAD, gap: 12 }}>
          {/* Avatar controls only, not a second avatar preview */}
          <Button
            title={isLoading ? (avatarUrl ? "Uploading..." : "Adding...") : avatarUrl ? "Change avatar" : "Add avatar"}
            onPress={onPickAvatar}
            disabled={isLoading}
          />
          {avatarUrl ? (
            <Button
              title={isLoading ? "Removing..." : "Remove avatar"}
              color="#c00"
              onPress={onRemoveAvatar}
              disabled={isLoading}
            />
          ) : null}

          <Text style={{ color: colors.text }}>Email: {user.email}</Text>

          {/* Name */}
          <TextInput
            placeholder="Name"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            value={name}
            onChangeText={setName}
            style={{
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              color: colors.text,
              padding: 12,
              borderRadius: 10,
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            }}
          />

          {/* Bio */}
          <TextInput
            placeholder="Bio"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            value={bio}
            onChangeText={setBio}
            style={{
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              color: colors.text,
              padding: 12,
              borderRadius: 10,
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            }}
          />

          {/* Save */}
          <Pressable
            onPress={onSave}
            disabled={isSaving || !hasChanges}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 14,
              borderRadius: 10,
              opacity: isSaving || !hasChanges ? 0.6 : 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSaving ? <ActivityIndicator /> : <Text style={{ color: "#0B0B0F", fontWeight: "700" }}>Save</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
