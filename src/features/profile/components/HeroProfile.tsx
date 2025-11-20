// src/features/profile/components/HeroProfile.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useThemeMode } from "src/theme/ThemeModeProvider";
import { spacing } from "src/theme/tokens";

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

    return (
        <View style={[styles.wrap, { paddingTop: spacing.xs }]}> 
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
                    {/* Handle hidden here since it's already shown in the top bar */}

                    <View style={styles.statsRight}>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user.moments ?? 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.text }]}>moments</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user.followers ?? 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.text }]}>followers</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user.following ?? 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.text }]}>following</Text>
                        </View>
                    </View>
                </View>

            </View>

            {/* (Moved handle under display name) */}

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

const AVATAR = 96;
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
        gap: spacing.sm,
        marginTop: spacing.xs,
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
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2, // borderColor set from theme in render
    },

    // Right column holds name and stats. Name is centered so it aligns over the middle stat box.
    rightCol: {
        flex: 1,
        marginLeft: spacing.sm,
        alignItems: "flex-start",
    },
    name: {
        fontSize: 18,
        lineHeight: 22,
        fontWeight: "700",
        marginBottom: spacing.sm,
        alignSelf: "flex-start",
    },
    handleDecor: {
        fontSize: 12,
        fontWeight: "500",
        opacity: 0.65,
        marginTop: -2,
        marginBottom: 4,
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
        minWidth: 64, // prevents collapse on very small phones
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 22,
    },
    statLabel: {
        marginTop: 1,
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 16,
        opacity: 0.75,
    },

    handleRow: { },
    handleText: { },

    bio: {
        marginTop: spacing.sm,
        fontSize: 13,
        lineHeight: 18,
    },
});
