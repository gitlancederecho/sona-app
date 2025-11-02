// src/features/profile/screens/ProfileScreen.tsx
import * as ImageManipulator from "expo-image-manipulator";
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
  const [isLoading, setIsLoading] = useState(false);

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
    if (isLoading) return;
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

      // get bytes from the local file (no blob in React Native)
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

      // choose a stable path and content type
      const path = `${user!.id}.jpg`;
      const contentType = asset.mimeType || "image/jpeg";

      const probe = await supabase.from("users").select("id").limit(1);
      if (probe.error) console.warn("Probe error:", probe.error);
      else console.warn("Probe OK");

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
              const path = `${user!.id}.jpg`;

            // delete from Storage
            const { error: delErr } = await supabase.storage
              .from("avatars")
              .remove([path]);
            if (delErr) {
              Alert.alert("Delete failed", delErr.message);
              return;
            }

            // clear avatar_url in users table
            const { error: updateErr } = await supabase
              .from("users")
              .update({ avatar_url: null })
              .eq("id", user!.id);

            if (updateErr) {
              Alert.alert("Save failed", updateErr.message);
              return;
            }

            setAvatarUrl(null);
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
        <Button
          title={isLoading ? "Uploading..." : "Change avatar"}
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
