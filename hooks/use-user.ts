"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

interface AuthUser {
  id: string;
  email: string;
}

export function useUser() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data as User);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      // Don't set global error here to avoid blocking UI, just log it
      // and maybe allow retry
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (mounted) {
          if (user) {
            setAuthUser({ id: user.id, email: user.email! });
            await fetchProfile(user.id);
          } else {
            setAuthUser(null);
            setProfile(null);
          }
        }
      } catch (err: any) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          if (mounted) {
            setAuthUser({ id: session.user.id, email: session.user.email! });
            // Only fetch profile if we don't have it or if the user changed
            if (!profile || profile.id !== session.user.id) {
              await fetchProfile(session.user.id);
            }
          }
        } else {
          if (mounted) {
            setAuthUser(null);
            setProfile(null);
          }
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const refreshProfile = async () => {
    if (authUser) {
      setLoading(true);
      await fetchProfile(authUser.id);
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return { authUser, profile, loading, error, signOut, refreshProfile };
}
