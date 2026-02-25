"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string;
  id_card_url?: string | null;
  myRiderId?: string | null;
}

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();

    if (res.status === 401) {
      createClient().auth.signOut();
      setProfile(null);
      setUserId(null);
      setError(null);
      return;
    }
    if (res.status === 404) {
      setProfile(null);
      setError("Profile not found");
      return;
    }
    if (data?.error) {
      setProfile(null);
      setError(data.error);
      return;
    }
    setProfile(data);
    setError(null);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (!user) {
        setProfile(null);
        setLoading(false);
        setError(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) {
        setProfile(null);
        setLoading(false);
        setError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchProfile().finally(() => setLoading(false));
  }, [userId, fetchProfile]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    await fetchProfile();
  }, [userId, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{ profile, loading, error, userId, refetch }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
