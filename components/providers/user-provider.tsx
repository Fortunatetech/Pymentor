"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
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
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (cancelled) return;
                if (authError) throw authError;

                if (user) {
                    setAuthUser({ id: user.id, email: user.email! });

                    const { data } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (cancelled) return;
                    if (data) setProfile(data as User);
                }
            } catch (err) {
                console.error("Error loading user:", err);
                if (!cancelled) setError(err as Error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (cancelled) return;
            if (event === "SIGNED_OUT") {
                setAuthUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [supabase]);

    const refreshProfile = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (data) setProfile(data as User);
        } catch (err) {
            console.error("Error refreshing profile:", err);
        }
    }, [supabase]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setAuthUser(null);
        setProfile(null);
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
