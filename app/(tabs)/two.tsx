import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeMode } from 'src/theme/ThemeModeProvider';
import { spacing } from 'src/theme/tokens';

export default function TabTwoScreen() {
  const { colors } = useThemeMode();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: spacing.lg }}>
        <Text style={[styles.title, { color: colors.text }]}>SONA</Text>
        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>Second tab, clean and working.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 8 }
});
