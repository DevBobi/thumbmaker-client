import { useState } from "react";
import { useAuthFetch } from "./use-auth-fetch";

export function useFreeCredits() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { authFetch } = useAuthFetch();

  const handleGetFreeCredits = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authFetch("/stripe/add-payment-method", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        setError("Failed to get free credits. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleGetFreeCredits,
  };
}
