import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from 'src/components/ui/GlassCard';
import { getSetlistsForUser, Setlist } from 'src/lib/api/setlists';
import { useAuth } from 'src/providers/AuthProvider';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { spacing } from 'src/theme/tokens';

export default function SetlistsScreen() {
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const router = useRouter();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await getSetlistsForUser(user.id);
    if (error) {
      setError(error.message);
      setSetlists([]);
    } else {
      setError(null);
      setSetlists(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    router.push('/setlists/edit');
  }

  function openStage(id: string) {
    router.push(`/setlists/stage/${id}`);
  }

  function openEdit(id: string) {
    router.push(`/setlists/edit/${id}`);
  }

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Setlists</Text>
        <Pressable onPress={openCreate} style={[styles.newBtn, { borderColor: colors.glassBorder }]}> 
          <Text style={[styles.newBtnText, { color: colors.text }]}>New Setlist</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.accentPrimary} /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={{ color: colors.textSecondary }}>{error}</Text></View>
      ) : (
        <FlatList
          data={setlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => (
            <GlassCard>
              <Pressable onPress={() => openStage(item.id)} style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={{ color: colors.textSecondary }}>{item.songs?.length ?? 0} songs</Text>
                </View>
              </Pressable>
              <View style={styles.cardActions}>
                <Pressable onPress={() => openEdit(item.id)} style={[styles.editBtn, { borderColor: colors.glassBorder }]}>
                  <Text style={[styles.editBtnText, { color: colors.text }]}>Edit</Text>
                </Pressable>
              </View>
            </GlassCard>
          )}
          ListEmptyComponent={<Text style={{ color: colors.textSecondary, paddingHorizontal: spacing.lg }}>No setlists yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  newBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1 },
  newBtnText: { fontSize: 14, fontWeight: '600' },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  editBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 10, borderWidth: 1 },
  editBtnText: { fontSize: 14, fontWeight: '600' },
});
