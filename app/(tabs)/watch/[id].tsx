// app/(tabs)/watch/[id].tsx
// Watch screen for playing HLS live streams using expo-video

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStreamById, Stream } from 'src/lib/api/streams';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { spacing } from 'src/theme/tokens';

// Fallback test HLS stream (Mux public demo, widely compatible)
const FALLBACK_HLS_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeMode();
  const router = useRouter();

  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const loadStream = useCallback(async () => {
    if (!id) {
      setError('No stream ID provided');
      setLoading(false);
      return;
    }

    const { data, error: err } = await getStreamById(id);
    if (err || !data) {
      setError(err?.message || 'Stream not found');
      setLoading(false);
      return;
    }

    setStream(data);
    setError(null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadStream();
  }, [loadStream]);

  const playbackUrl = stream?.playback_url || FALLBACK_HLS_URL;

  // Create video player with expo-video
  // Recreate player whenever URL changes to ensure source loads
  const player = useVideoPlayer(playbackUrl, (player) => {
    try {
      player.play();
    } catch (e) {
      console.error('[watch] Player initialization error:', e);
    }
  });

  function handleBack() {
    router.back();
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading stream...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load stream</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <Pressable
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls
          allowsFullscreen
        />
        {videoLoading && (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color={colors.accentPrimary} />
          </View>
        )}
      </View>

      {/* Stream Info */}
      <View style={[styles.infoContainer, { paddingHorizontal: spacing.lg }]}>
        {/* Back button */}
        <Pressable onPress={handleBack} style={styles.backButtonTop}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </Pressable>

        {/* Manual play control (helps on iOS/Expo Go) */}
        <Pressable
          onPress={() => {
            try {
              player.play();
            } catch (e) {
              console.error('[watch] manual play error:', e);
            }
          }}
          style={[styles.playButton, { borderColor: colors.glassBorder }]}
        >
          <Text style={[styles.playButtonText, { color: colors.text }]}>Play</Text>
        </Pressable>

        {/* Stream title */}
        <View style={{ marginTop: spacing.lg }}>
          <View style={[styles.liveBadge, { backgroundColor: colors.accentPrimary }]}>
            <Text style={[styles.liveText, { color: colors.textOnAccent }]}>● LIVE</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{stream?.title || 'Untitled Stream'}</Text>

          {/* Placeholder for future features */}
          <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
            Viewer count, chat, and tipping coming soon.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoContainer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  backButtonTop: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 28,
  },
  playButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  liveBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
