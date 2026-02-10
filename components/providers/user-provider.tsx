"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

interface AuthUser {
    id: string;
    email: string;
}

interface UserContextType {
    authUser: AuthUser | null;
    profile: User | null;
    loading: boolean;
    error: Error | null;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    // Use ref to track current profile ID to avoid stale closures
    const currentProfileIdRef = useRef<string | null>(null);

    const fetchProfile = useCallback(async (userId: string, retryCount = 0): Promise<User | null> => {
        const maxRetries = 3;
        const retryDelay = 500; // ms

        try {
            const { data, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (fetchError) {
                // Profile might not be created yet (race condition with signup trigger)
                if (fetchError.code === 'PGRST116' && retryCount < maxRetries) {
                    // No rows returned - profile not created yet, retry after delay
                    console.log(`Profile not found, retrying (${retryCount + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return fetchProfile(userId, retryCount + 1);
                }
                console.error("Error fetching profile:", fetchError);
                return null;
            }

            return data as User;
        } catch (err) {
            console.error("Error in fetchProfile:", err);
            return null;
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
                        const fetchedProfile = await fetchProfile(user.id);
                        if (mounted && fetchedProfile) {
                            setProfile(fetchedProfile);
                            currentProfileIdRef.current = fetchedProfile.id;
                        }
                    } else {
                        setAuthUser(null);
                        setProfile(null);
                        currentProfileIdRef.current = null;
                    }
                }
            } catch (err) {
                if (mounted) setError(err as Error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                if (session?.user) {
                    const userId = session.user.id;
                    setAuthUser({ id: userId, email: session.user.email! });

                    // Fetch profile on SIGNED_IN or if user ID changed
                    // Don't re-set loading on TOKEN_REFRESHED to avoid UI flash
                    const shouldFetch =
                        event === 'SIGNED_IN' ||
                        event === 'TOKEN_REFRESHED' ||
                        currentProfileIdRef.current !== userId;

                    if (shouldFetch) {
                        if (event !== 'TOKEN_REFRESHED') {
                            setLoading(true);
                        }
                        const fetchedProfile = await fetchProfile(userId);
                        if (mounted && fetchedProfile) {
                            setProfile(fetchedProfile);
                            currentProfileIdRef.current = fetchedProfile.id;
                        }
                        if (mounted && event !== 'TOKEN_REFRESHED') {
                            setLoading(false);
                        }
                    }
                } else {
                    setAuthUser(null);
                    setProfile(null);
                    currentProfileIdRef.current = null;
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    const refreshProfile = useCallback(async () => {
        if (authUser) {
            const fetchedProfile = await fetchProfile(authUser.id);
            if (fetchedProfile) {
                setProfile(fetchedProfile);
                currentProfileIdRef.current = fetchedProfile.id;
            }
        }
    }, [authUser, fetchProfile]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setAuthUser(null);
        setProfile(null);
        currentProfileIdRef.current = null;
        window.location.href = "/";
    }, [supabase]);

    return (
        <UserContext.Provider value={{ authUser, profile, loading, error, refreshProfile, signOut }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
