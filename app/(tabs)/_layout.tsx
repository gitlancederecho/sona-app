// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useThemeMode } from "src/theme/ThemeModeProvider";

export default function TabsLayout() {
  const { colors } = useThemeMode();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.glassBorder,
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";
          if (route.name === "index") iconName = focused ? "home" : "home-outline";
          if (route.name === "setlists") iconName = focused ? "list" : "list-outline";
          if (route.name === "profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home" }}
      />
      {/* Folder-based tab: app/(tabs)/setlists/index.tsx */}
      <Tabs.Screen
        name="setlists"
        options={{ title: "Setlists" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
      {/**
       * Intentionally NOT declaring a tab for `watch` routes so they can be pushed screens.
       * e.g. app/(tabs)/watch/[id].tsx will be navigated to via router.push.
       */}
    </Tabs>
  );
}
