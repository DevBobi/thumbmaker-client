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
  
  if (!userId) return redirectToSignIn();

  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Error fetching current user:", error);
    // Fallback to basic user data if currentUser fails
    user = null;
  }

  // Fetch real subscription data from API
  let subscription = {
    isActive: false,
    credits: 0,
    gotFreeCredits: false
  };

  try {
    const subscriptionResponse = await serverAuthFetch("/api/user/subscription");
    if (subscriptionResponse.ok) {
      const subscriptionData = await subscriptionResponse.json();
      subscription = {
        isActive: subscriptionData.isActive || false,
        credits: subscriptionData.credits || 0,
        gotFreeCredits: subscriptionData.gotFreeCredits || false
      };
    }
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    // Keep default values if API call fails
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          user={{
            name: user?.firstName || "User",
            email: user?.emailAddresses?.[0]?.emailAddress || "user@example.com",
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
