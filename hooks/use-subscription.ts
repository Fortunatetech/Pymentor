"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subscription } from "@/types";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setSubscription(data as Subscription);
        }
      }
      
      setLoading(false);
    };

    getSubscription();
  }, [supabase]);

  const isPro = subscription?.plan === "pro_monthly" || 
                subscription?.plan === "pro_annual" || 
                subscription?.plan === "lifetime";

  const isActive = subscription?.status === "active" || 
                   subscription?.status === "trialing";

  return { 
    subscription, 
    loading, 
    isPro: isPro && isActive,
    plan: subscription?.plan || "free"
  };
}
