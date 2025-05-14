import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export async function serverAuthFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { sessionId } = await auth();
  const template = process.env.CLERK_JWT_TEMPLATE as string;
  const client = await clerkClient();
  const token = await client.sessions.getToken(sessionId as string, template);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.jwt}`,
    ...options.headers,
  };

  return fetch(`${process.env.API_URL}${path}`, {
    ...options,
    headers,
  });
}
