export const lightPalette = {
    bg: '#F5F5F7',
    bgAlt: '#E9EAEC',
    text: '#0B0B0F',
    // Gradient accent per design: violet → amber
    accentGradient: { from: '#7A3EFF', to: '#FFAC3E' },
    // Primary accent color for text-only contexts (no gradients)
    accentPrimary: '#7A3EFF',
    // Text color when placed on top of accent/gradient surfaces
    textOnAccent: '#FFFFFF',
    glassTint: 'rgba(255,255,255,0.75)', // stronger presence on light backgrounds
    glassBorder: 'rgba(0,0,0,0.08)',     // darker hairline for contrast in light mode
    card: "rgba(0,0,0,0.06)", // subtle shadowed glass in light mode
};

export const darkPalette = {
    bg: '#0B0B0F',
    bgAlt: '#101218',
    text: '#F5F5F7',
    // Keep gradient consistent across modes; tweak if needed later
    accentGradient: { from: '#7A3EFF', to: '#FFAC3E' },
    accentPrimary: '#7A3EFF',
    textOnAccent: '#FFFFFF',
    glassTint: 'rgba(16,18,24,0.55)',
    glassBorder: 'rgba(255,255,255,0.1)',
    card: "rgba(255,255,255,0.08)", // frosted glass effect for dark mode
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
