import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import GlassCard from "src/components/ui/GlassCard";
import GlassPill from "src/components/ui/GlassPill";
import { useThemeMode } from "src/theme/ThemeModeProvider";
import { radius, spacing } from "src/theme/tokens";

const { height } = Dimensions.get("window");
const HERO_MAX = Math.min(height * 0.46, 420);
const HERO_MIN = 96;

type Props = {
    user: {
        id: string;
        name?: string;
        handle?: string;
        avatar_url?: string | null;
        followers?: number;
        following?: number;
        moments?: number;
    };
    children?: React.ReactNode; // Flow/content goes here
};

export default function HeroProfile({ user, children }: Props) {
    const { colors } = useThemeMode();
    const y = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler({
        onScroll: e => {
            y.value = e.contentOffset.y;
        },
    });

    // micro “stage ready” haptic on mount
    useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const heroStyle = useAnimatedStyle(() => {
        const h = interpolate(y.value, [0, HERO_MAX], [HERO_MAX, HERO_MIN], Extrapolate.CLAMP);
        const scale = interpolate(y.value, [0, HERO_MAX], [1, 0.96], Extrapolate.CLAMP);
        return { height: h, transform: [{ scale }] };
    });

    const titleStyle = useAnimatedStyle(() => {
        const t = interpolate(y.value, [0, HERO_MAX], [0, -18], Extrapolate.CLAMP);
        const s = interpolate(y.value, [0, HERO_MAX], [1, 0.92], Extrapolate.CLAMP);
        return { transform: [{ translateY: t }, { scale: s }] };
    });

    // haptic when “collapsed” state flips
    useEffect(() => {
        let prev = false;
        const id = setInterval(() => {
            const collapsed = y.value > HERO_MAX - HERO_MIN;
            if (collapsed !== prev) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                prev = collapsed;
            }
        }, 140);
        return () => clearInterval(id);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {/* Absolute hero */}
            <Animated.View style={[styles.heroWrap, heroStyle]}>
                <GlassCard style={styles.heroCard} padding={spacing.lg}>
                    <View style={styles.row}>
                        <Image
                            source={
                                user.avatar_url
                                    ? { uri: `${user.avatar_url}?v=hero` }
                                    : undefined
                            }
                            style={styles.avatar}
                        />
                        <Animated.View style={[{ flex: 1 }, titleStyle]}>
                            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                                {user.name ?? "Unnamed"}
                            </Text>
                            {user.handle ? (
                                <Text style={{ color: colors.text, opacity: 0.6, marginTop: 2 }}>@{user.handle}</Text>
                            ) : null}

                            <View style={styles.statsRow}>
                                <GlassPill label="Followers" value={user.followers ?? 0} />
                                <GlassPill label="Following" value={user.following ?? 0} />
                                <GlassPill label="Moments" value={user.moments ?? 0} />
                            </View>
                        </Animated.View>
                    </View>
                </GlassCard>
            </Animated.View>

            {/* Scroll area: offset to sit below hero */}
            <Animated.ScrollView
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: HERO_MAX + spacing.lg, paddingHorizontal: spacing.xl }}
            >
                {children}
            </Animated.ScrollView>
        </View>
    );
}

const AVATAR = 84;

const styles = StyleSheet.create({
    heroWrap: {
        position: "absolute",
        left: spacing.xl,
        right: spacing.xl,
        top: spacing.xl,
        zIndex: 2,
    },
    heroCard: {
        borderRadius: radius.xl,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg,
    },
    avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    name: {
        fontSize: 28,
        fontWeight: "700",
    },
    statsRow: {
        marginTop: spacing.md,
        flexDirection: "row",
        gap: spacing.sm,
    },
});
