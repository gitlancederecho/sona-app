// src/components/LiveCard.tsx
// Glass-style card component for displaying a live stream on the Home screen

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { radius, spacing } from 'src/theme/tokens';

type Props = {
  id: string;
  title: string;
  // Add more fields as needed (thumbnail, artist name, viewer count, etc.)
};

export default function LiveCard({ id, title }: Props) {
  const { colors } = useThemeMode();
  const router = useRouter();

  function handlePress() {
    router.push(`/(tabs)/watch/${id}`);
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.glassBorder },
        pressed && { opacity: 0.8 },
      ]}
    >
      {/* Thumbnail placeholder with gradient overlay */}
      <View style={styles.thumbnail}>
        <LinearGradient
          colors={[colors.accentGradient.from, colors.accentGradient.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
        </LinearGradient>

        {/* LIVE badge */}
        <View style={[styles.liveBadge, { backgroundColor: colors.accentGradient.from }]}>
          <Text style={[styles.liveText, { color: colors.textOnAccent }]}>● LIVE</Text>
        </View>
      </View>

      {/* Stream title */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: spacing.sm,
  },
  liveBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  info: {
    padding: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});
