import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { useThemeMode } from "src/theme/ThemeModeProvider";
import { radius, shadow } from "src/theme/tokens";

type Props = ViewProps & {
  intensity?: number;              // blur amount (0–100ish)
  tint?: "light" | "dark";         // override auto tint if needed
  padding?: number;                // optional padding
  border?: boolean;                // show the subtle glass border
};

export const GlassCard: React.FC<Props> = ({
  style,
  children,
  intensity = 30,
  tint,
  padding,
  border = true,
  ...rest
}) => {
  const { isDark, colors } = useThemeMode();
  const blurTint = tint ?? (isDark ? "dark" : "light");

  return (
    <View style={[styles.wrap, shadow.card, style]} {...rest}>
      <BlurView intensity={intensity} tint={blurTint} style={StyleSheet.absoluteFill} />
      <View
        style={[
          styles.inner,
          { padding: padding ?? 16 },
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
