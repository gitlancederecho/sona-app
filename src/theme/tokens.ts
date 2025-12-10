// SONA dark-only theme palette
export const darkPalette = {
    // Backgrounds
    bg: '#111111',
    surface: 'rgba(255, 255, 255, 0.04)',
    surfaceElevated: 'rgba(255, 255, 255, 0.06)',
    
    // Text
    text: '#F5F5F5',
    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textOnAccent: '#FFFFFF',
    
    // Accent gradient: violet → amber
    accentGradient: { from: '#7A3EFF', to: '#FFAC3E' },
    accentGradientFrom: '#7A3EFF',
    accentGradientTo: '#FFAC3E',
    accentPrimary: '#7A3EFF',
    
    // Glass UI tokens
    glassTint: 'rgba(16,18,24,0.55)',
    glassBorder: 'rgba(255,255,255,0.1)',
    card: 'rgba(255,255,255,0.08)',
};

export const radius = { xl: 24, pill: 999 };
export const spacing = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 };
export const shadow = {
    card: {
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },
};
