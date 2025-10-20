import Dashboard from "@/components/pages/Dashboard";
import { serverAuthFetch } from "@/lib/server-auth-fetch";
import { Project } from "@/types";

export default async function DashboardPage() {
  let projects: Project[] = [];

  try {
    const response = await serverAuthFetch("/api/projects");
    if (response.ok) {
      projects = await response.json();
    } else {
      console.error("Failed to fetch projects:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    // Continue with empty array if fetch fails
  }

  return <Dashboard projects={projects} />;
}
