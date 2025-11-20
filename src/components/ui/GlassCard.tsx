import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { useThemeMode } from "src/theme/ThemeModeProvider";
import { radius, shadow, spacing } from "src/theme/tokens";

type Props = ViewProps & {
    intensity?: number;              // blur amount (0–100ish)
    tint?: "light" | "dark";         // override auto tint if needed
    padding?: number;                // optional padding
    border?: boolean;                // show the subtle glass border
    sheen?: boolean;            // NEW
};

export const GlassCard: React.FC<Props> = ({
    style,
    children,
    intensity = 40,
    tint,
    padding,
    border = true,
    sheen = false,            // NEW
    ...rest
}) => {
    const { isDark, colors } = useThemeMode();
    const blurTint = tint ?? (isDark ? "dark" : "light");

    return (
        <View style={[styles.wrap, shadow.card, style]} {...rest}>
            {/* Background blur */}
            <BlurView intensity={intensity} tint={blurTint} style={StyleSheet.absoluteFill} />

            {/* Tinted overlay for stronger glass presence */}
            <View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFillObject,
                    {
                        backgroundColor: colors.glassTint,
                        opacity: isDark ? 0.85 : 0.9,
                    },
                ]}
            />

            {/* subtle top sheen */}
            {sheen && (
                <View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        right: 0,
                        height: 56,
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
                        opacity: 0.6,
                        borderTopLeftRadius: radius.xl,
                        borderTopRightRadius: radius.xl,
                    }}
                />
            )}

            <View
                style={[
                    styles.inner,
                    { padding: padding ?? spacing.sm },
                    border && { borderColor: colors.glassBorder, borderWidth: StyleSheet.hairlineWidth },
                ]}
            >
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        borderRadius: radius.xl,
        overflow: "hidden",
    },
    inner: {
        // content lives above the blur
    },
});

export default GlassCard;
