import React from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import { useThemeMode } from "src/theme/ThemeModeProvider";
import { radius, spacing } from "src/theme/tokens";

type Props = ViewProps & {
  label: string;
  value?: string | number;
  minWidth?: number;        // keeps pills from jittering
};

const GlassPill: React.FC<Props> = ({ label, value, minWidth = 88, style, ...rest }) => {
  const { colors } = useThemeMode();

  return (
    <View
      style={[
        styles.pill,
        {
          minWidth,
          backgroundColor: colors.glassTint,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: colors.text, opacity: 0.7 }]}>{label}</Text>
      {value !== undefined ? (
        <Text style={[styles.value, { color: colors.accentPrimary }]}>{value}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 32,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  label: { fontSize: 12 },
  value: { fontSize: 12, fontWeight: "700" },
});

export default GlassPill;
