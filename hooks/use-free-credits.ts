import { useState } from "react";
import { useAuthFetch } from "./use-auth-fetch";

type TrialActivationResponse = {
  trialCredits?: number;
  trialStatus?: string;
  message?: string;
};

export function useFreeCredits() {
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [isActivatingTrial, setIsActivatingTrial] = useState(false);
  const [error, setError] = useState("");
  const { authFetch } = useAuthFetch();

  const handleAddPaymentMethod = async () => {
    setIsAddingPaymentMethod(true);
    setError("");

    try {
      const response = await authFetch("/stripe/add-payment-method", {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        const message =
          data.error || data.message || "Failed to open payment setup.";
        setError(message);
        throw new Error(message);
      }

      window.location.href = data.url;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      setError("Something went wrong. Please try again.");
      throw err;
    } finally {
      setIsAddingPaymentMethod(false);
    }
  };

  const handleActivateTrial = async (): Promise<TrialActivationResponse> => {
    setIsActivatingTrial(true);
    setError("");

    try {
      const response = await authFetch("/user/trial/start", {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data.error ||
          data.message ||
          "Failed to activate your free trial credits.";
        setError(message);
        throw new Error(message);
      }

      return data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      const fallback = "Unable to activate trial. Please try again.";
      setError(fallback);
      throw new Error(fallback);
    } finally {
      setIsActivatingTrial(false);
    }
  };

  return {
    isAddingPaymentMethod,
    isActivatingTrial,
    error,
    handleAddPaymentMethod,
    handleActivateTrial,
  };
}
