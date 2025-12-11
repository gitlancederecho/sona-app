import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSetlistById, Setlist } from 'src/lib/api/setlists';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { spacing } from 'src/theme/tokens';

export default function StageModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeMode();
  const router = useRouter();
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await getSetlistById(id);
      if (data) setSetlist(data);
    })();
  }, [id]);

  const current = useMemo(() => setlist?.songs?.[index] ?? null, [setlist, index]);

  function prev() { setIndex((i) => Math.max(0, i - 1)); }
  function next() { setIndex((i) => Math.min((setlist?.songs?.length ?? 1) - 1, i + 1)); }

  // TODO: keep-awake: If expo-keep-awake is available in the project (and supported in Expo Go), enable here.
  // For now, we avoid adding native dependencies.

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.glassBorder }]}>
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.center}>
        <Text style={[styles.songTitle, { color: colors.text }]}>{current?.title || setlist?.title || 'Setlist'}</Text>
        {!!current?.notes && (
          <Text style={[styles.songNotes, { color: colors.textSecondary }]}>{current?.notes}</Text>
        )}
      </View>
      <View style={styles.controls}>
        <Pressable onPress={prev} style={[styles.ctrlBtn, { borderColor: colors.glassBorder }]}>
          <Text style={[styles.ctrlText, { color: colors.text }]}>Prev</Text>
        </Pressable>
        <Pressable onPress={next} style={[styles.ctrlBtn, { borderColor: colors.glassBorder }]}>
          <Text style={[styles.ctrlText, { color: colors.text }]}>Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { padding: spacing.lg },
  backBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  songTitle: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },
  songNotes: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.lg },
  ctrlBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1 },
  ctrlText: { fontSize: 16, fontWeight: '700' },
});
