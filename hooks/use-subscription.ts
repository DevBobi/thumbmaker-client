import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { CREDIT_EVENT_NAME } from "@/lib/credit-events";

type Subscription = {
  plan?: string | null;
  credits: number;
  isActive: boolean;
  gotFreeCredits: boolean;
  trialStatus?: string | null;
  trialCreditsAwarded?: boolean;
};

// Shared state to coordinate fetches across components
let sharedSubscription: Subscription | null = null;
let sharedLoading = false;
let sharedListeners: Set<(subscription: Subscription | null, loading: boolean) => void> = new Set();
let pendingRefresh: Promise<Subscription> | null = null;

const notifyListeners = (subscription: Subscription | null, loading: boolean) => {
  sharedListeners.forEach((listener) => listener(subscription, loading));
};

const fetchSubscription = async (authFetch: (path: string) => Promise<Response>): Promise<Subscription> => {
  const response = await authFetch("/user/subscription");
  if (!response.ok) {
    throw new Error("Failed to fetch subscription");
  }
  const data = await response.json();
  return {
    plan: data.plan || null,
    credits: typeof data.credits === "number" ? data.credits : 0,
    isActive: data.isActive || false,
    gotFreeCredits: data.gotFreeCredits || false,
    trialStatus: data.trialStatus || null,
    trialCreditsAwarded: data.trialCreditsAwarded || false,
  };
};

export function useSubscription(initialSubscription?: Subscription) {
  const { authFetch } = useAuthFetch();
  const [subscription, setSubscription] = useState<Subscription | null>(
    initialSubscription || sharedSubscription
  );
  const [isLoading, setIsLoading] = useState(!initialSubscription && !sharedSubscription);

  // Register listener for shared state updates
  useEffect(() => {
    const listener = (sub: Subscription | null, loading: boolean) => {
      setSubscription(sub);
      setIsLoading(loading);
    };
    sharedListeners.add(listener);
    
    // If we have shared data, use it immediately
    if (sharedSubscription) {
      setSubscription(sharedSubscription);
      setIsLoading(false);
    }

    return () => {
      sharedListeners.delete(listener);
    };
  }, []);

  const refreshSubscription = useCallback(async () => {
    // If there's already a pending refresh, wait for it
    if (pendingRefresh) {
      try {
        const result = await pendingRefresh;
        sharedSubscription = result;
        sharedLoading = false;
        notifyListeners(result, false);
        return result;
      } catch (error) {
        // If pending refresh failed, continue with new fetch
        pendingRefresh = null;
      }
    }

    // If already loading, don't start another fetch
    if (sharedLoading) {
      return sharedSubscription;
    }

    try {
      sharedLoading = true;
      notifyListeners(sharedSubscription, true);
      
      const refreshPromise = fetchSubscription(authFetch);
      pendingRefresh = refreshPromise;
      
      const result = await refreshPromise;
      sharedSubscription = result;
      sharedLoading = false;
      pendingRefresh = null;
      notifyListeners(result, false);
      return result;
    } catch (error) {
      console.error("Failed to refresh subscription", error);
      sharedLoading = false;
      pendingRefresh = null;
      notifyListeners(sharedSubscription, false);
      throw error;
    }
  }, [authFetch]);

  // Initial fetch on mount if no data
  useEffect(() => {
    if (!initialSubscription && !sharedSubscription) {
      refreshSubscription();
    } else if (initialSubscription) {
      // Update shared state with initial data
      sharedSubscription = initialSubscription;
      notifyListeners(initialSubscription, false);
    }
  }, [initialSubscription, refreshSubscription]);

  // Set up refresh listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleRefresh = () => {
      refreshSubscription();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener(CREDIT_EVENT_NAME, handleRefresh);
    const interval = setInterval(handleRefresh, 15000);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(CREDIT_EVENT_NAME, handleRefresh);
      clearInterval(interval);
    };
  }, [refreshSubscription]);

  return {
    subscription,
    isLoading,
    refreshSubscription,
    credits: subscription?.credits ?? 0,
  };
}

