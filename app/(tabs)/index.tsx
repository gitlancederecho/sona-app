import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LiveCard from "src/components/LiveCard";
import { getLiveStreams, Stream } from "src/lib/api/streams";
import { useAuth } from "src/providers/AuthProvider";
import { useThemeMode } from "src/theme/ThemeModeProvider";
import { spacing } from "src/theme/tokens";

export default function Home() {
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const router = useRouter();

  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStreams = useCallback(async () => {
    const { data, error: err } = await getLiveStreams();
    if (err) {
      setError(err.message);
      setStreams([]);
    } else {
      setStreams(data || []);
      setError(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/sign-in");
      return;
    }
    loadStreams();
  }, [user, loadStreams, router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStreams();
  }, [loadStreams]);

  if (!user) return null;

  const MAX_W = 640;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 48,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentPrimary} />
        }
      >
        <View style={{ width: "100%", maxWidth: MAX_W, paddingHorizontal: spacing.lg }}>
          {/* Header */}
          <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.lg }}>
            <Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>SONA</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs }}>
              Where music happens.
            </Text>
          </View>

          {/* Live Now Section */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.md }}>
              Live Now
            </Text>

            {loading ? (
              <View style={{ paddingVertical: spacing.xl, alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.accentPrimary} />
              </View>
            ) : error ? (
              <View
                style={{
                  padding: spacing.lg,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
              >
                <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
                  Unable to load streams. {error}
                </Text>
              </View>
            ) : streams.length === 0 ? (
              <View
                style={{
                  padding: spacing.xl,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
              >
                <Text style={{ color: colors.textSecondary, textAlign: "center", fontSize: 16 }}>
                  No one is live right now.
                </Text>
                <Text style={{ color: colors.textSecondary, textAlign: "center", fontSize: 14, marginTop: spacing.sm }}>
                  Check back soon!
                </Text>
              </View>
            ) : (
              streams.map((stream) => <LiveCard key={stream.id} id={stream.id} title={stream.title} />)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
