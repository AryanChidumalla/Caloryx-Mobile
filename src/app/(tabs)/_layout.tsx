import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      {/* 1. Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size - 1}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Nutrition Tab */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              size={size - 1}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Workout Tab */}
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "barbell" : "barbell-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size - 1}
              color={color}
            />
          ),
        }}
      />

      {/* Auxiliary screens hidden from tab bar */}
      <Tabs.Screen
        name="add-meal"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="meals"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
