import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export async function serverAuthFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { sessionId } = await auth();
  
  // Check if sessionId exists
  if (!sessionId) {
    throw new Error("No active session found");
  }

  const template = process.env.CLERK_JWT_TEMPLATE || "default";
  const client = await clerkClient();
  
  try {
    // Try to get token with template
    const token = await client.sessions.getToken(sessionId, template);
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.jwt}`,
      ...options.headers,
    };

    return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    // Fallback: try without template or with default template
    console.warn("JWT template not found, trying fallback:", error);
    
    try {
      const token = await client.sessions.getToken(sessionId, "default");
      
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.jwt}`,
        ...options.headers,
      };

      return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${path}`, {
        ...options,
        headers,
      });
    } catch (fallbackError) {
      // Last resort: make request without JWT token
      console.warn("JWT token generation failed, making request without auth:", fallbackError);
      
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${path}`, {
        ...options,
        headers,
      });
    }
  }
}
