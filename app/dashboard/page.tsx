import { serverAuthFetch } from "@/lib/server-auth-fetch";
import Dashboard from "@/components/pages/Dashboard";

export default async function DashboardPage() {
  const projects = await serverAuthFetch("/api/projects/recent");
  const projectsData = await projects.json();

  return <Dashboard projects={projectsData} />;
}
