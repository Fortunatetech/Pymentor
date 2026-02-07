"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                // If no profile found, maybe create one? Or just log.
                // For now, log error.
                console.error("Error fetching profile:", error);
                throw error;
            }

            setProfile(data as User);
        } catch (err: any) {
            console.error("Error in fetchProfile:", err);
            // Don't set global error here to avoid blocking UI heavily
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
                        // Or if we just signed in (event === 'SIGNED_IN')
                        if (!profile || profile.id !== session.user.id || event === 'SIGNED_IN') {
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
            // Don't set global loading to true to avoid full screen spinner, 
            // just update in background or use a local loading state if needed.
            // But user likely wants to see update.
            // Let's keep existing behavior or maybe just await.
            await fetchProfile(authUser.id);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

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
