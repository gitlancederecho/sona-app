// src/features/profile/screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "src/lib/supabase";
import { useAuth } from "src/providers/AuthProvider";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      const { data, error } = await supabase.from("users")
        .select("name,bio")
        .eq("id", user.id)
        .maybeSingle();
      if (!active || error) return;
      setName(data?.name ?? "");
      setBio(data?.bio ?? "");
    }
    load();
    return () => { active = false; };
  }, [user]);

  async function onSave() {
    if (!user) return;
    const { error } = await supabase.from("users")
      .update({ name, bio })
      .eq("id", user.id);
    if (error) Alert.alert("Update failed", error.message);
    else Alert.alert("Saved", "Profile updated.");
  }

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>Profile</Text>
        <Text>Email: {user.email}</Text>
        <TextInput placeholder="Name" value={name} onChangeText={setName}
          style={{ borderWidth: 1, padding: 12, borderRadius: 10 }} />
        <TextInput placeholder="Bio" value={bio} onChangeText={setBio}
          style={{ borderWidth: 1, padding: 12, borderRadius: 10 }} />
        <Button title="Save" onPress={onSave} />
      </View>
    </SafeAreaView>
  );
}
