// app/(tabs)/watch/[id].tsx
// Watch screen for playing HLS live streams

import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStreamById, Stream } from 'src/lib/api/streams';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { spacing } from 'src/theme/tokens';

// Fallback test HLS stream (Sintel short film)
const FALLBACK_HLS_URL = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8';

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeMode();
  const router = useRouter();

  const videoRef = useRef<Video>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

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
        <Video
          ref={videoRef}
          source={{ uri: playbackUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
      </View>

      {/* Stream Info */}
      <View style={[styles.infoContainer, { paddingHorizontal: spacing.lg }]}>
        {/* Back button */}
        <Pressable onPress={handleBack} style={styles.backButtonTop}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
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
  },
  video: {
    width: '100%',
    height: '100%',
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
