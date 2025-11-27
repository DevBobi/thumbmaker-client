import { useCallback, useState } from "react";
import { useAuthFetch } from "./use-auth-fetch";

type TrialActionResponse = {
  message?: string;
  error?: string;
  trialEndsAt?: string;
  checkoutUrl?: string;
  url?: string;
};

export function useTrialActions() {
  const { authFetch } = useAuthFetch();
  const defaultPriceId =
    process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_STANDARD_PLAN_ID ||
    process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID ||
    "";
  const [isStarting, setIsStarting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTrial = useCallback(
    async (priceId?: string) => {
      const resolvedPriceId = priceId || defaultPriceId;

      if (!resolvedPriceId) {
        setError("Missing price configuration for trial.");
        return null;
      }

      setIsStarting(true);
      setError(null);

      try {
        const response = await authFetch("/api/stripe/create-checkout-session", {
          method: "POST",
          body: JSON.stringify({ priceId: resolvedPriceId }),
        });

        const data: TrialActionResponse = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Failed to start checkout.");
        }

        if (data?.url) {
          window.location.href = data.url;
        }

        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to start checkout.";
        setError(message);
        throw err;
      } finally {
        setIsStarting(false);
      }
    },
    [authFetch]
  );

  const convertTrial = useCallback(async () => {
    setIsConverting(true);
    setError(null);

    try {
      window.location.href = "/pricing";
      return null;
    } finally {
      setIsConverting(false);
    }
  }, []);

  return {
    startTrial,
    convertTrial,
    isStarting,
    isConverting,
    error,
    setError,
  };
}

export const useFreeCredits = useTrialActions;
