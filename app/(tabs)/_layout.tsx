// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import SonaTabBar from "src/features/navigation/components/SonaTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBar: (props) => <SonaTabBar {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home" }}
      />
      <Tabs.Screen
        name="setlists"
        options={{ title: "Setlists" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
    </Tabs>
  );
}
