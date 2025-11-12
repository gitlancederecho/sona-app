// src/features/profile/components/HeroProfile.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeMode } from "src/theme/ThemeModeProvider";

type Props = {
    user: {
        id: string;
        name?: string;
        handle?: string;
        avatar_url?: string | null;
        followers?: number;
        following?: number;
        moments?: number; // map to posts later if you want
        bio?: string;
    };
};

export default function HeroProfile({ user }: Props) {
    const { colors } = useThemeMode();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 6) + 12 }]}>
            {/* Row: avatar on the left, right side has name on top of stats */}
            <View style={styles.topRow}>
                {/* Avatar with + badge */}
                <View style={styles.avatarWrap}>
                    <View style={[
                        styles.avatarRing,
                        { borderColor: colors.accent, backgroundColor: "transparent" },
                    ]}>
                        {user.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: colors.card }]} />
                        )}
                    </View>

                    <View style={[styles.addBadge, { backgroundColor: colors.card, borderColor: colors.bg }]}>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>＋</Text>
                    </View>
                </View>

                {/* Right side: name above the CENTER stat (Moments), then the stats row */}
                <View style={styles.rightCol}>
                    {/* Name above Moments, both left-aligned */}
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {user.name || "Unnamed"}
                    </Text>

                    <View style={styles.statsRight}>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user.moments ?? 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Moments</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user.followers ?? 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Followers</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user.following ?? 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Following</Text>
                        </View>
                    </View>
                </View>

            </View>

            {/* Handle row */}
            {!!user.handle && (
                <View style={styles.handleRow}>
                    <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7 }}>◎</Text>
                    <Text style={[styles.handleText, { color: colors.text }]} numberOfLines={1}>
                        @{user.handle}
                    </Text>
                </View>
            )}

            {/* Bio */}
            {!!user.bio && (
                <Text style={[styles.bio, { color: colors.text }]} numberOfLines={2}>
                    {user.bio}
                </Text>
            )}
        </View>
    );

}

function StatBox({
    value,
    label,
    color,
}: {
    value: number | string;
    label: string;
    color: string;
}) {
    return (
        <View style={styles.statBox}>
            <Text style={[styles.statValue, { color }]} numberOfLines={1}>
                {value}
            </Text>
            <Text style={[styles.statLabel, { color }]} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
}

const AVATAR = 128;
const MAX_W = 640;
const H_PAD = 16;

const styles = StyleSheet.create({
    wrap: {
        alignSelf: "center",
        width: "100%",
        maxWidth: MAX_W,
        paddingHorizontal: H_PAD,
        paddingBottom: 12,
        backgroundColor: "transparent",
    },

    // layout
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 8,
    },

    avatarWrap: {
        position: "relative",
    },
    avatarRing: {
        width: AVATAR + 8,
        height: AVATAR + 8,
        borderRadius: (AVATAR + 8) / 2,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
    },
    addBadge: {
        position: "absolute",
        right: -4,
        bottom: -4,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2, // borderColor set from theme in render
    },

    // Right column holds name and stats. Name is centered so it aligns over the middle stat box.
    rightCol: {
        flex: 1,
        marginLeft: 16,
        alignItems: "flex-start",
    },
    name: {
        fontSize: 22,
        lineHeight: 26,
        fontWeight: "700",
        marginBottom: 8,
        alignSelf: "flex-start",
    },

    // 3 equal columns; center stays under the centered name. Space scales on any device width.
    statsRight: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: 12,
    },
    statBox: {
        flex: 1,
        alignItems: "flex-start",
        minWidth: 72, // prevents collapse on very small phones
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 20,
    },
    statLabel: {
        marginTop: 2,
        fontSize: 12,
        opacity: 0.7,
    },

    handleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },
    handleText: {
        fontSize: 14,
        opacity: 0.85,
    },

    bio: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 20,
    },
});
