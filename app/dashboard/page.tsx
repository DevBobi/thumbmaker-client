import { serverAuthFetch } from "@/lib/server-auth-fetch";
import Dashboard from "@/components/pages/Dashboard";

export default async function DashboardPage() {
  const products = await serverAuthFetch("/api/products/recent");
  const productsData = await products.json();

  return <Dashboard products={productsData} />;
}
