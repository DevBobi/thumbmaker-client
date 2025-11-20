import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "./use-auth-fetch";
import { CreditSummary } from "@/types/credits";

export function useCreditSummary(enabled = true) {
  const { authFetch } = useAuthFetch();

  return useQuery<CreditSummary>({
    queryKey: ["credit-summary"],
    enabled,
    queryFn: async () => {
      const response = await authFetch("/api/user/credits");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Failed to load credit summary"
        );
      }

      return data;
    },
    staleTime: 30 * 1000,
  });
}

