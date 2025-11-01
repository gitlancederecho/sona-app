console.log('ENV URL =>', process.env.EXPO_PUBLIC_SUPABASE_URL);

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUsers } from 'src/lib/api/users';

type User = {
  id: string;
  name: string | null;
  bio: string | null;
};

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data as User[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading users…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.muted}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.logo}>SONA</Text>
        <Text style={styles.subtitle}>Where music happens.</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name ?? 'Unnamed'}</Text>
            {!!item.bio && <Text style={styles.cardSubtitle}>{item.bio}</Text>}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.muted, { paddingHorizontal: 16 }]}>No users yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111111' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 8, paddingHorizontal: 16 },
  logo: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  listContent: { padding: 16, paddingTop: 20, gap: 12 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardSubtitle: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  muted: { color: 'rgba(255,255,255,0.7)' }
});
