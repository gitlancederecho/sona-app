// src/features/profile/screens/ProfileScreen.tsx
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "src/lib/supabase";
import { useAuth } from "src/providers/AuthProvider";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
      setName(data?.name ?? "");
      setBio(data?.bio ?? "");
      setAvatarUrl(data?.avatar_url ?? null);
    }
    load();
    return () => {
      active = false;
    };
  }, [user]);

  async function onSave() {
    if (!user) return;
    const { error } = await supabase
      .from("users")
      .update({ name, bio })
      .eq("id", user.id);
    if (error) Alert.alert("Update failed", error.message);
    else Alert.alert("Saved", "Profile updated.");
  }

  async function onPickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Photo access is required to change your avatar.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      aspect: [1, 1],
    });
    if (res.canceled || !res.assets?.length) return;

    const asset = res.assets[0];
    const fileUri = asset.uri;

    // get bytes from the local file (no blob in React Native)
    const resp = await fetch(fileUri);
    const arrayBuffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // choose a stable path and content type
    const path = `${user!.id}.jpg`;
    const contentType = asset.mimeType || "image/jpeg";

    // upload bytes to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, bytes, { upsert: true, contentType });

    if (uploadErr) {
      Alert.alert("Upload failed", uploadErr.message);
      return;
    }

    // get public URL (no error object returned here)
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    // save to profile
    const { error: updateErr } = await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", user!.id);

    if (updateErr) {
      Alert.alert("Save failed", updateErr.message);
      return;
    }

    setAvatarUrl(publicUrl);
    Alert.alert("Success", "Avatar updated!");
  }

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 12, alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>Profile</Text>

        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#eee" }}
          />
        ) : (
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: "#eee",
            }}
          />
        )}
        <Button title="Change avatar" onPress={onPickAvatar} />

        <Text>Email: {user.email}</Text>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={{ borderWidth: 1, padding: 12, borderRadius: 10, width: "100%" }}
        />
        <TextInput
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          style={{ borderWidth: 1, padding: 12, borderRadius: 10, width: "100%" }}
        />
        <Button title="Save" onPress={onSave} />
      </View>
    </SafeAreaView>
  );
}
