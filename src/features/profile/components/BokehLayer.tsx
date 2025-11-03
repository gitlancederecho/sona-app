import React, { useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { useThemeMode } from "src/theme/ThemeModeProvider";

const { width, height } = Dimensions.get("window");

const DOTS = 8;          // performance budget
const DURATION = 8000;   // slow, calm drift

const Dot: React.FC<{ i: number; isDark: boolean; t: SharedValue<number> }> = ({ i, isDark, t }) => {
  const style = useAnimatedStyle(() => {
    const x = ((i * 97) % width) + (t.value - 0.5) * 22;   // tiny drift
    const y = ((i * 71) % height) + (t.value - 0.5) * 12;
    const size = 38 + ((i * 13) % 28);
    return {
      transform: [{ translateX: x }, { translateY: y }],
      width: size,
      height: size,
      opacity: isDark ? 0.16 : 0.08,
      backgroundColor: "#99C7FF",
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

export const BokehLayer: React.FC = () => {
  const { isDark } = useThemeMode();
  const t = useSharedValue(0);

  React.useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);

  const nodes = useMemo(() => Array.from({ length: DOTS }).map((_, i) => i), []);
  return (
    <>
      {nodes.map((i) => (
        <Dot key={i} i={i} isDark={isDark} t={t} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    borderRadius: 999,
  },
});

export default BokehLayer;