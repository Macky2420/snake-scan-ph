import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDatabase } from "../data/sqlite";

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch((err) => {
      console.error("Database init failed:", err);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="map" />
      </Stack>
    </GestureHandlerRootView>
  );
}
