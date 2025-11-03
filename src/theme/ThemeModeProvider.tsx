import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { darkPalette, lightPalette } from './tokens';

type Mode = 'light' | 'dark';
type ThemeCtx = {
  mode: Mode;
  colors: typeof lightPalette;
  isDark: boolean;
  AmbientCrossfade: React.FC<{ children: React.ReactNode }>;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme();
  const [mode, setMode] = useState<Mode>((scheme ?? 'light') as Mode);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setMode((colorScheme ?? 'light') as Mode);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 19 || h < 6) setMode('dark');
  }, []);

  const progress = useSharedValue(mode === 'dark' ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(mode === 'dark' ? 1 : 0, { duration: 600 });
  }, [mode]);

  const colors = mode === 'dark' ? darkPalette : lightPalette;
  const isDark = mode === 'dark';

  const AmbientCrossfade: ThemeCtx['AmbientCrossfade'] = ({ children }) => {
    const style = useAnimatedStyle(() => {
      const bg = interpolateColor(progress.value, [0, 1], [lightPalette.bg, darkPalette.bg]);
      return { backgroundColor: bg, flex: 1 };
    });
    return <Animated.View style={style}>{children}</Animated.View>;
  };

  const value = useMemo(() => ({ mode, colors, isDark, AmbientCrossfade }), [mode, colors, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};
