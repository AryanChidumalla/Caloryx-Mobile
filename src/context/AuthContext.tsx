import {
  fetchUserProfile,
  migrateGuestMealsToSupabase,
  migrateGuestProfileToSupabase,
  upsertUserProfile,
} from "@/services/nutritionSync";
import { migrateGuestHealthData } from "@/storage/healthStorage";
import {
  getGuestProfile,
  getMeals,
  saveGuestProfile,
} from "@/storage/nutritionStorage";
import { GuestProfile, UserProfile } from "@/types/nutrition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

export type AuthMode = "guest" | "authenticated" | null;

type AuthContextType = {
  session: Session | null;
  user: User | null;
  mode: AuthMode;
  profile: UserProfile | null;
  hasCompletedProfile: boolean;
  loading: boolean;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  saveProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ONBOARDING_COMPLETE_KEY = "@caloryx/onboarding_complete";
const AUTH_MODE_KEY = "@caloryx/auth_mode";
const GUEST_MIGRATED_KEY = "@caloryx/guest_migrated_for_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<AuthMode>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        const userProfile = await fetchUserProfile(userId);
        setProfile(userProfile);
        return userProfile;
      } catch (err) {
        console.error("Failed to load user profile:", err);
        return null;
      }
    },
    [],
  );

  const loadGuestProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const guestData = await getGuestProfile();
      if (!guestData) {
        setProfile(null);
        return null;
      }
      const guestUserProfile: UserProfile = {
        id: "guest",
        username: "Guest User",
        sex: guestData.sex ?? null,
        age: guestData.age ?? null,
        height: guestData.height ?? null,
        weight: guestData.weight ?? null,
        activity_level: guestData.activity_level ?? null,
        primary_goal: guestData.primary_goal || guestData.goal || null,
        target_calorie: guestData.target_calorie ?? null,
      };
      setProfile(guestUserProfile);
      return guestUserProfile;
    } catch (err) {
      console.error("Failed to load guest profile:", err);
      return null;
    }
  }, []);

  const handleGuestMigration = useCallback(
    async (userId: string) => {
      try {
        const alreadyMigrated = await AsyncStorage.getItem(
          `${GUEST_MIGRATED_KEY}_${userId}`,
        );
        if (alreadyMigrated === "true") {
          return;
        }

        // 1. Migrate guest meals
        const guestMeals = await getMeals();
        if (guestMeals && guestMeals.length > 0) {
          await migrateGuestMealsToSupabase(userId, guestMeals);
        }

        // 2. Migrate guest profile if user lacks target calories in Supabase
        const guestData = await getGuestProfile();
        if (guestData && (guestData.target_calorie || guestData.weight)) {
          const existingUserProfile = await fetchUserProfile(userId);
          if (!existingUserProfile?.target_calorie) {
            await migrateGuestProfileToSupabase(userId, guestData);
            await loadUserProfile(userId);
          }
        }

        // 3. Migrate guest health data (water, steps, weight)
        await migrateGuestHealthData(userId);

        await AsyncStorage.setItem(`${GUEST_MIGRATED_KEY}_${userId}`, "true");
      } catch (err) {
        console.warn("Guest data migration warning:", err);
      }
    },
    [loadUserProfile],
  );

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (session?.user?.id) {
      return await loadUserProfile(session.user.id);
    }
    if (mode === "guest") {
      return await loadGuestProfile();
    }
    return null;
  }, [session, mode, loadUserProfile, loadGuestProfile]);

  const saveProfile = useCallback(
    async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
      if (mode === "guest" || !session?.user?.id) {
        // Save as guest in local AsyncStorage
        const existingGuest = (await getGuestProfile()) || {};
        const updatedGuest: GuestProfile = {
          ...existingGuest,
          sex: profileData.sex !== undefined ? profileData.sex : existingGuest.sex,
          age: profileData.age !== undefined ? profileData.age : existingGuest.age,
          height:
            profileData.height !== undefined
              ? profileData.height
              : existingGuest.height,
          weight:
            profileData.weight !== undefined
              ? profileData.weight
              : existingGuest.weight,
          activity_level:
            profileData.activity_level !== undefined
              ? profileData.activity_level
              : existingGuest.activity_level,
          primary_goal:
            profileData.primary_goal !== undefined
              ? profileData.primary_goal
              : existingGuest.primary_goal || existingGuest.goal,
          goal:
            (profileData.primary_goal !== undefined
              ? profileData.primary_goal
              : existingGuest.goal || existingGuest.primary_goal) || undefined,
          target_calorie:
            profileData.target_calorie !== undefined
              ? profileData.target_calorie
              : existingGuest.target_calorie,
        };
        await saveGuestProfile(updatedGuest);

        const guestUserProfile: UserProfile = {
          id: "guest",
          username: "Guest User",
          ...updatedGuest,
          primary_goal: updatedGuest.primary_goal || updatedGuest.goal || null,
        };
        setProfile(guestUserProfile);
        return guestUserProfile;
      }

      const updated = await upsertUserProfile({
        ...profileData,
        id: session.user.id,
      });

      setProfile(updated);
      return updated;
    },
    [session, mode],
  );

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const onboardingComplete = await AsyncStorage.getItem(
          ONBOARDING_COMPLETE_KEY,
        );

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Failed to get Supabase session:", error);
        }

        if (!mounted) return;

        if (data.session) {
          setSession(data.session);
          setMode("authenticated");
          await AsyncStorage.setItem(AUTH_MODE_KEY, "authenticated");
          await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");

          // Load profile & handle migration
          await loadUserProfile(data.session.user.id);
          await handleGuestMigration(data.session.user.id);
        } else if (onboardingComplete === "true") {
          const storedMode = await AsyncStorage.getItem(AUTH_MODE_KEY);
          if (storedMode === "guest") {
            setMode("guest");
            await loadGuestProfile();
          }
        }
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession) {
        setMode("authenticated");
        await AsyncStorage.setItem(AUTH_MODE_KEY, "authenticated");
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");

        await loadUserProfile(newSession.user.id);
        await handleGuestMigration(newSession.user.id);
      } else if (event === "SIGNED_OUT") {
        setMode(null);
        setProfile(null);
        await AsyncStorage.removeItem(AUTH_MODE_KEY);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile, loadGuestProfile, handleGuestMigration]);

  async function continueAsGuest() {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    await AsyncStorage.setItem(AUTH_MODE_KEY, "guest");
    setMode("guest");
    await loadGuestProfile();
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out from Supabase:", error);
    } finally {
      await AsyncStorage.removeItem(AUTH_MODE_KEY);
      setSession(null);
      setProfile(null);
      setMode(null);
    }
  }

  // Profile is complete if target_calorie exists and is positive
  const hasCompletedProfile =
    mode === "guest" ||
    (mode === "authenticated" &&
      profile != null &&
      Number(profile.target_calorie) > 0);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        mode,
        profile,
        hasCompletedProfile,
        loading,
        continueAsGuest,
        signOut,
        refreshProfile,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
