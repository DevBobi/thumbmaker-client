import { useCallback } from "react";

export const useAuthFetch = () => {
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      return response;
    },
    []
  );

  return { authFetch };
};
