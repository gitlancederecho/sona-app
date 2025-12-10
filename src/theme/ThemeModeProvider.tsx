import React, { createContext, useContext, useMemo } from 'react';
import { View } from 'react-native';
import { darkPalette } from './tokens';

type ThemeCtx = {
  colors: typeof darkPalette;
  isDark: true;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colors = darkPalette;
  const isDark = true as const;

  const value = useMemo(() => ({ colors, isDark }), [colors]);
  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>{children}</View>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};
