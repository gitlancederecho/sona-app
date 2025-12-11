import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { radius, shadow, spacing } from 'src/theme/tokens';

const labels: Record<string, string> = {
  index: 'Home',
  setlists: 'Setlists',
  profile: 'Profile',
};

const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  setlists: { active: 'list', inactive: 'list-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

// Avoid importing types from '@react-navigation/bottom-tabs' to prevent runtime/module resolution issues.
export default function SonaTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeMode();

  return (
    <View pointerEvents="box-none" style={[styles.root, { paddingBottom: Math.max(insets.bottom, 12) }] }>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.card,
            borderColor: colors.glassBorder,
            shadowColor: (shadow.card as any).shadowColor,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          const label = labels[route.name] ?? descriptors[route.key]?.options?.title ?? route.name;
          const iconSet = icons[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
          const iconName = isFocused ? iconSet.active : iconSet.inactive;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
              testID={descriptors[route.key]?.options?.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
            >
              <View
                style={[
                  styles.itemInner,
                  isFocused && { backgroundColor: colors.accentPrimary },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={18}
                  color={isFocused ? colors.textOnAccent : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? colors.textOnAccent : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.xl,
    borderWidth: 1,
    // subtle shadow (from tokens)
    ...(shadow.card as any),
  },
  item: {
    flex: 1,
  },
  itemInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
