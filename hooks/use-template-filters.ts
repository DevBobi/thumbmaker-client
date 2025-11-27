import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "./use-auth-fetch";

export interface FilterOption {
  label: string;
  value: string;
}

export interface TemplateFilterOptions {
  creators: FilterOption[];
  niches: FilterOption[];
}

export const useTemplateFilters = () => {
  const { authFetch } = useAuthFetch();

  return useQuery<TemplateFilterOptions>({
    queryKey: ["templateFilterOptions"],
    queryFn: async () => {
      const response = await authFetch("/templates/filter-options");
      if (!response.ok) {
        throw new Error("Failed to fetch filter options");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

