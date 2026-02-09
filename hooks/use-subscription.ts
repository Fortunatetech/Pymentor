"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subscription } from "@/types";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchSubscription = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSubscription(data as Subscription);
      }
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchSubscription();
  }, [fetchSubscription]);

  const isPro = subscription?.plan === "pro_monthly" ||
    subscription?.plan === "pro_annual" ||
    subscription?.plan === "lifetime";

  const isActive = subscription?.status === "active" ||
    subscription?.status === "trialing";

  return {
    subscription,
    loading,
    isPro: isPro && isActive,
    plan: subscription?.plan || "free",
    refresh,
  };
}
