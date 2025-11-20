// src/features/profile/screens/EditProfileScreen.tsx
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from 'src/components/ui/GlassCard';
import { supabase } from 'src/lib/supabase';
import { useAuth } from 'src/providers/AuthProvider';
import { useThemeMode } from 'src/theme/ThemeModeProvider';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useThemeMode();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState({ name: '', bio: '', handle: '', email: '', avatarUrl: '' });

  const [handleStatus, setHandleStatus] = useState<'idle'|'checking'|'available'|'taken'|'invalid'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const hasProfileChanges = name !== initial.name || bio !== initial.bio || handle !== initial.handle || avatarUrl !== initial.avatarUrl;
  const emailChanged = email !== initial.email;

  const isHandleValid = useMemo(() => {
    const v = handle.trim().toLowerCase();
    if (v.length < 3 || v.length > 30) return false;
    if (!/^[a-z0-9_]+$/.test(v)) return false;
    if (/__+/.test(v)) return false;
    if (/^_|_$/.test(v)) return false;
    return true;
  }, [handle]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name, bio, handle, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (!active) return;
      if (error) { setLoadingProfile(false); return; }
      setName(data?.name || '');
      setBio(data?.bio || '');
      setHandle(data?.handle || '');
      setEmail(data?.email || '');
      setAvatarUrl(data?.avatar_url || null);
      setInitial({ name: data?.name || '', bio: data?.bio || '', handle: data?.handle || '', email: data?.email || '', avatarUrl: data?.avatar_url || '' });
      setLoadingProfile(false);
    })();
    return () => { active = false; };
  }, [user]);

  // Handle availability check
  useEffect(() => {
    if (!user) return;
    if (handle === initial.handle) { setHandleStatus('idle'); return; }
    const v = handle.trim().toLowerCase();
    setHandle(v);
    if (!isHandleValid) { setHandleStatus('invalid'); return; }
    setHandleStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('handle', v)
        .limit(1);
      if (!data || data.length === 0) setHandleStatus('available');
      else if (user && data[0].id === user.id) setHandleStatus('idle');
      else setHandleStatus('taken');
    }, 500);
  }, [handle, isHandleValid, initial.handle, user]);

  async function saveProfile() {
    if (!user || savingProfile || !hasProfileChanges) return;
    if (handleStatus === 'checking' || handleStatus === 'invalid' || handleStatus === 'taken') return;
    setSavingProfile(true);
    const payload: Record<string, any> = {};
    if (name !== initial.name) payload.name = name;
    if (bio !== initial.bio) payload.bio = bio;
    if (handle !== initial.handle) payload.handle = handle;
    if (avatarUrl !== initial.avatarUrl) payload.avatar_url = avatarUrl;
    const { error } = await supabase.from('users').update(payload).eq('id', user.id);
    setSavingProfile(false);
    if (error) { Alert.alert('Update failed', error.message); return; }
    setInitial({ ...initial, name, bio, handle, avatarUrl: avatarUrl || '' });
    Alert.alert('Saved', 'Profile updated.');
  }

  function validateEmailFormat(v: string) {
    if (!v) return false;
    return /.+@.+\..+/.test(v);
  }

  async function saveEmail() {
    if (!user || savingEmail || !emailChanged) return;
    if (email && !validateEmailFormat(email.trim())) { Alert.alert('Invalid email', 'Please enter a valid address.'); return; }
    setSavingEmail(true);
    try {
      if (email) {
        const { error: updErr } = await supabase.auth.updateUser({ email: email.trim() });
        if (updErr) throw new Error(updErr.message);
      }
      const { error: rowErr } = await supabase.from('users').update({ email: email || null }).eq('id', user.id);
      if (rowErr) throw new Error(rowErr.message);
      setInitial(i => ({ ...i, email }));
      Alert.alert('Email updated', email ? 'Check inbox for confirmation link (if required).' : 'Email removed.');
    } catch (e: any) {
      Alert.alert('Email update failed', e.message || 'Unknown error');
    } finally {
      setSavingEmail(false);
    }
  }

  async function changeAvatar() {
    if (!user || avatarBusy) return;
    setAvatarBusy(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Photo access required.'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.5 });
      if (res.canceled || !res.assets?.length) return;
      let fileUri = res.assets[0].uri;
      try {
        const manipulated = await ImageManipulator.manipulateAsync(fileUri, [{ resize: { width: 512 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
        fileUri = manipulated.uri;
      } catch {}
      const resp = await fetch(fileUri); const buf = await resp.arrayBuffer(); const bytes = new Uint8Array(buf);
      const path = `${user.id}.jpg`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, bytes, { upsert: true, contentType: 'image/jpeg' });
      if (uploadErr) { Alert.alert('Upload failed', uploadErr.message); return; }
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: saveErr } = await supabase.from('users').update({ avatar_url: pub.publicUrl }).eq('id', user.id);
      if (saveErr) { Alert.alert('Save failed', saveErr.message); return; }
      setAvatarUrl(pub.publicUrl); Alert.alert('Success', 'Avatar updated.');
    } finally { setAvatarBusy(false); }
  }

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 64, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 640, paddingHorizontal: 16, paddingTop: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>Edit Profile</Text>
          <Text style={{ marginTop: 4, opacity: 0.7, color: colors.text }}>Update your public info.</Text>

          {loadingProfile ? (
            <View style={{ marginTop: 32 }}><ActivityIndicator /></View>
          ) : (
            <View style={{ gap: 20, marginTop: 20 }}>
              <GlassCard>
                <View style={{ padding: 16, gap: 14 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>Public Profile</Text>
                  <TextInput
                    placeholder='Name'
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                    style={inputStyle(colors, isDark)}
                  />
                  <TextInput
                    placeholder='Username'
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={handle}
                    onChangeText={setHandle}
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                    style={[inputStyle(colors, isDark), { borderColor: handleStatus === 'invalid' || handleStatus === 'taken' ? '#D84A4A' : inputStyle(colors, isDark).borderColor }]}
                  />
                  <Text style={{ fontSize: 12, color: colors.text, opacity: 0.7 }}>
                    {handleStatus === 'idle' && 'Stable username.'}
                    {handleStatus === 'checking' && 'Checking availability…'}
                    {handleStatus === 'available' && 'Available ✓'}
                    {handleStatus === 'taken' && 'Already taken ✕'}
                    {handleStatus === 'invalid' && '3–30 chars; a–z, 0–9, underscores (no double/edge underscores).'}
                  </Text>
                  <TextInput
                    placeholder='Bio'
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                    style={[inputStyle(colors, isDark), { minHeight: 100, textAlignVertical: 'top' }]}
                  />
                  <Pressable
                    onPress={saveProfile}
                    disabled={savingProfile || !hasProfileChanges || handleStatus === 'checking' || handleStatus === 'invalid' || handleStatus === 'taken'}
                    style={primaryBtn(colors, savingProfile || !hasProfileChanges)}
                  >
                    {savingProfile ? <ActivityIndicator /> : <Text style={{ color: colors.textOnAccent, fontWeight: '600' }}>Save Profile</Text>}
                  </Pressable>
                  <Pressable
                    onPress={changeAvatar}
                    disabled={avatarBusy}
                    style={[primaryBtn(colors, avatarBusy), { backgroundColor: colors.card }]}
                  >
                    {avatarBusy ? <ActivityIndicator /> : <Text style={{ color: colors.text }}>Change Avatar</Text>}
                  </Pressable>
                </View>
              </GlassCard>

              <GlassCard>
                <View style={{ padding: 16, gap: 14 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>Account Email</Text>
                  <TextInput
                    placeholder='Add or change email'
                    autoCapitalize='none'
                    keyboardType='email-address'
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                    style={inputStyle(colors, isDark)}
                  />
                  <Pressable
                    onPress={saveEmail}
                    disabled={savingEmail || !emailChanged}
                    style={primaryBtn(colors, savingEmail || !emailChanged)}
                  >
                    {savingEmail ? <ActivityIndicator /> : <Text style={{ color: colors.textOnAccent, fontWeight: '600' }}>Save Email</Text>}
                  </Pressable>
                  <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6 }}>Changing email may require confirmation depending on project settings.</Text>
                </View>
              </GlassCard>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function inputStyle(colors: any, isDark: boolean) {
  return {
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    color: colors.text,
    padding: 14,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  } as const;
}

function primaryBtn(colors: any, disabled: boolean) {
  return {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    opacity: disabled ? 0.6 : 1,
  } as const;
}
