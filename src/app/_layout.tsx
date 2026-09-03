import { AuthProvider, useAuth } from "@/context/AuthContext";
import { HealthProvider } from "@/context/HealthContext";
import { NutritionProvider } from "@/context/NutritionContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const { mode, hasCompletedProfile, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />

      {!mode && <Redirect href="/auth/welcome" />}

      {mode === "authenticated" && !hasCompletedProfile && (
        <Redirect href="/auth/profile-setup" />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NutritionProvider>
          <WorkoutProvider>
            <HealthProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </HealthProvider>
          </WorkoutProvider>
        </NutritionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },
});
