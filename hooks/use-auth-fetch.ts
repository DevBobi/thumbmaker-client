import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export function useAuthFetch() {
  const { getToken } = useAuth();

  const authFetch = useCallback(async (
    path: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await getToken();

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...options,
      headers,
    });
  }, [getToken]);

  const authFetchWithFormData = useCallback(async (
    path: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await getToken();

    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...options,
      headers,
      body: formData,
    });
  }, [getToken]);

  return { authFetch, authFetchWithFormData };
}
