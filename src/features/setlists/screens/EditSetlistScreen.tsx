import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSetlist, CreateSetlistPayload, deleteSetlist, getSetlistById, SetlistSong, updateSetlist } from 'src/lib/api/setlists';
import { useAuth } from 'src/providers/AuthProvider';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { spacing } from 'src/theme/tokens';

export default function EditSetlistScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [songs, setSongs] = useState<SetlistSong[]>([]);
  const [loading, setLoading] = useState(false);

  const isEdit = useMemo(() => Boolean(id), [id]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await getSetlistById(id);
    if (error) { setLoading(false); return; }
    if (data) {
      setTitle(data.title);
      setSongs(data.songs ?? []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function addSong() {
    const newSong: SetlistSong = { id: Math.random().toString(36).slice(2), title: '', notes: '' };
    setSongs((prev) => [...prev, newSong]);
  }

  function updateSong(idx: number, patch: Partial<SetlistSong>) {
    setSongs((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }

  function removeSong(idx: number) {
    setSongs((prev) => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    if (!user) return;
    const payload: CreateSetlistPayload = { title: title.trim() || 'Untitled Setlist', songs };
    setLoading(true);
    const res = isEdit ? await updateSetlist(id!, payload) : await createSetlist(user.id, payload);
    setLoading(false);
    if (res.error) {
      Alert.alert('Error', res.error.message);
    } else {
      router.back();
    }
  }

  async function onDelete() {
    if (!id) return;
    Alert.alert('Delete Setlist?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSetlist(id); router.back(); } },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <Text style={[styles.header, { color: colors.text }]}>{isEdit ? 'Edit Setlist' : 'New Setlist'}</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Setlist title"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.glassBorder, backgroundColor: colors.surface }]}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Songs</Text>
          <Pressable onPress={addSong} style={[styles.addBtn, { borderColor: colors.glassBorder }]}> 
            <Text style={[styles.addBtnText, { color: colors.text }]}>Add Song</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item, index }) => (
          <View style={[styles.songCard, { borderColor: colors.glassBorder, backgroundColor: colors.surface }]}> 
            <TextInput
              value={item.title}
              onChangeText={(t) => updateSong(index, { title: t })}
              placeholder="Song title"
              placeholderTextColor={colors.textSecondary}
              style={[styles.songTitle, { color: colors.text }]}
            />
            <TextInput
              value={item.notes ?? ''}
              onChangeText={(t) => updateSong(index, { notes: t })}
              placeholder="Notes"
              placeholderTextColor={colors.textSecondary}
              style={[styles.songNotes, { color: colors.text }]}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
              <Pressable onPress={() => removeSong(index)} style={[styles.removeBtn, { borderColor: colors.glassBorder }]}> 
                <Text style={[styles.removeBtnText, { color: colors.text }]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, paddingHorizontal: spacing.lg }}>No songs yet.</Text>}
      />

      <View style={{ padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' }}>
        {isEdit ? (
          <Pressable onPress={onDelete} style={[styles.deleteBtn, { borderColor: colors.glassBorder }]}> 
            <Text style={[styles.deleteBtnText, { color: colors.text }]}>Delete</Text>
          </Pressable>
        ) : <View />}
        <Pressable disabled={loading} onPress={save} style={[styles.saveBtn, { borderColor: colors.glassBorder }]}> 
          <Text style={[styles.saveBtnText, { color: colors.text }]}>{loading ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.xs },
  addBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1 },
  addBtnText: { fontSize: 14, fontWeight: '600' },
  songCard: { borderWidth: 1, borderRadius: 12, padding: spacing.md },
  songTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  songNotes: { fontSize: 14, minHeight: 60 },
  removeBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1 },
  removeBtnText: { fontSize: 14, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1 },
  deleteBtnText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1 },
  saveBtnText: { fontSize: 14, fontWeight: '700' },
});
