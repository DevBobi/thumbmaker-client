import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { serverAuthFetch } from "@/lib/server-auth-fetch";

type LayoutProps = {
  children: React.ReactNode;
};

export async function AppLayout({ children }: LayoutProps) {
  const { userId, redirectToSignIn } = await auth();
  const user = await currentUser();

  if (!userId) return redirectToSignIn();

  const res = await serverAuthFetch("/api/user/subscription");
  const subscription = await res.json();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          user={{
            name: user?.firstName || "",
            email: user?.emailAddresses[0].emailAddress || "",
            avatar: user?.imageUrl || "",
          }}
          subscription={{
            isActive: subscription.isActive,
            credits: subscription.credits,
            gotFreeCredits: subscription.gotFreeCredits,
          }}
        />
        <div className="flex flex-col flex-1 overflow-x-hidden">
          <Navbar />
          <main className="flex-1">
            <div className="py-6 px-4 md:px-6 max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
