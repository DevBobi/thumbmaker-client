import { useAuth } from "@clerk/nextjs";

export function useAuthFetch() {
  const { getToken } = useAuth();

  const authFetch = async (
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
  };

  const authFetchWithFormData = async (
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
  };

  return { authFetch, authFetchWithFormData };
}
