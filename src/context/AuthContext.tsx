import {
  fetchUserProfile,
  migrateGuestMealsToSupabase,
  upsertUserProfile,
} from "@/services/nutritionSync";
import { getMeals } from "@/storage/nutritionStorage";
import { UserProfile } from "@/types/nutrition";
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

  const handleGuestMigration = useCallback(async (userId: string) => {
    try {
      const alreadyMigrated = await AsyncStorage.getItem(
        `${GUEST_MIGRATED_KEY}_${userId}`,
      );
      if (alreadyMigrated === "true") {
        return;
      }

      const guestMeals = await getMeals();
      if (guestMeals && guestMeals.length > 0) {
        await migrateGuestMealsToSupabase(userId, guestMeals);
        await AsyncStorage.setItem(`${GUEST_MIGRATED_KEY}_${userId}`, "true");
      }
    } catch (err) {
      console.warn("Guest data migration warning:", err);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!session?.user?.id) return null;
    return await loadUserProfile(session.user.id);
  }, [session, loadUserProfile]);

  const saveProfile = useCallback(
    async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user to save profile for.");
      }

      console.log("Saving profile:", profileData);

      const updated = await upsertUserProfile({
        ...profileData,
        id: session.user.id,
      });

      setProfile(updated);
      return updated;
    },
    [session],
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
  }, [loadUserProfile, handleGuestMigration]);

  async function continueAsGuest() {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    await AsyncStorage.setItem(AUTH_MODE_KEY, "guest");
    setMode("guest");
    setProfile(null);
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
