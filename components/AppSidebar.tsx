"use client";
import { useEffect, useState } from "react";
import { NavUser } from "@/components/NavUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  FolderPlus,
  History,
  ImagePlus,
  LayoutDashboard,
  LayoutTemplate,
  Moon,
  Sparkles,
  Sun,
  Zap,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSubscription } from "@/hooks/use-subscription";

type User = {
  name: string;
  email: string;
  avatar: string;
};
type Subscription = {
  plan?: string | null;
  credits: number;
  isActive: boolean;
  gotFreeCredits: boolean;
  trialStatus?: string | null;
  trialCreditsAwarded?: boolean;
};

const navigationItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Youtube Thumbnail",
    path: "/dashboard/create-youtube-thumbnail",
    icon: ImagePlus,
  },
  {
    title: "Add Project",
    path: "/dashboard/projects",
    icon: FolderPlus,
  },
  {
    title: "Templates",
    path: "/dashboard/templates",
    icon: LayoutTemplate,
  },
  {
    title: "History",
    path: "/dashboard/history",
    icon: History,
  },
];

export function AppSidebar({
  user,
  subscription,
}: {
  user: User;
  subscription: Subscription;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const { subscription: subscriptionState, isLoading: isLoadingSubscription } = useSubscription(subscription);
  
  // Track if we've received data from API (once loaded, stay loaded to prevent blinking)
  // Use a ref to track if we've ever received data, so it doesn't toggle during refreshes
  const [hasLoadedSubscription, setHasLoadedSubscription] = useState(() => {
    // Check if initial subscription prop has meaningful data
    return subscription.credits > 0 || subscription.isActive || subscription.plan;
  });

  useEffect(() => {
    // Once we have subscription data (even if credits are 0), mark as loaded
    // This prevents the card from blinking during background refreshes
    if (subscriptionState && !hasLoadedSubscription) {
      setHasLoadedSubscription(true);
    }
  }, [subscriptionState, hasLoadedSubscription]);

  const isCollapsed = state === "collapsed";
  // Use subscriptionState with fallback to subscription prop to prevent flickering
  const currentSubscription = subscriptionState || subscription;
  const normalizedCredits =
    typeof currentSubscription?.credits === "number" ? currentSubscription.credits : 0;
  const isTrialing = ["trialing", "ending"].includes(currentSubscription?.trialStatus || "");
  const hasUsedTrial = Boolean(currentSubscription?.trialCreditsAwarded);
  const hasPaidPlanCredits = normalizedCredits > 4; // Paid plans have more than 4 credits
  const isPaidPlan = currentSubscription?.isActive && hasPaidPlanCredits;
  const isTrialEnding = currentSubscription?.trialStatus === "ending";
  
  // Show upgrade CTA only when:
  // 1. Data is loaded from API (hasLoadedSubscription), AND
  // 2. We have subscription data (currentSubscription), AND
  // 3. User has NO paid plan credits available (credits <= 4), AND
  //    - Subscription is not active, OR
  //    - Credits are 0, OR
  //    - On trial and used all trial credits
  // Don't show if user has paid plan credits available (they're good to go!)
  // Note: We don't check isLoadingSubscription here to prevent blinking during background refreshes
  // Once loaded, we keep showing/hiding based on actual data, not loading state
  const showUpgradeCTA = hasLoadedSubscription && 
    currentSubscription && 
    (hasPaidPlanCredits 
      ? false // User has paid plan credits, don't show upgrade card
      : (
          !currentSubscription.isActive || 
          normalizedCredits <= 0 || 
          (isTrialing && hasUsedTrial && normalizedCredits <= 0)
        )
    );

  const upgradeMessage = !currentSubscription?.isActive
    ? "Unlock premium features and generate high-converting thumbnails every month."
    : isPaidPlan && normalizedCredits <= 0
      ? "You've used all your plan credits. Upgrade or wait for your next billing cycle."
      : normalizedCredits <= 0 && isTrialing
        ? isTrialEnding
          ? "Your trial period is ending. Upgrade to keep generating thumbnails."
          : "You've used your trial credits. Upgrade to keep generating thumbnails."
        : "You're out of credits. Upgrade to keep generating thumbnails.";

  const upgradeLink = !currentSubscription?.isActive ? "/pricing" : "/dashboard/billing";

  const upgradeLabel = !currentSubscription?.isActive
    ? "Choose a plan"
    : isTrialing
      ? "Upgrade now"
      : "Upgrade to Pro";

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar 
        collapsible="icon" 
        className="bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900"
        style={{
          '--sidebar-width-icon': '4.5rem'
        } as React.CSSProperties}
      >
        <SidebarHeader className={cn(
          "border-b-1 border-gray-200 dark:border-gray-800 transition-all duration-300",
          isCollapsed ? "px-3 py-4" : "px-6 py-[18px]"
        )}>
          <Link href="/dashboard" className="block group">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex items-center justify-center transition-all duration-300 w-full">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      TM
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>ThumbMaker AI</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    ThumbMaker
                  </h1>
                  <Badge variant="secondary" className="uppercase text-[9px] px-1.5 py-0.5 font-bold bg-primary/10 text-primary border-0">
                    AI
                  </Badge>
                </div>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  YouTube Thumbnail Creator
                </p> */}
              </div>
            )}
          </Link>
        </SidebarHeader>
      <SidebarContent className={cn(
        "transition-all duration-300",
        isCollapsed ? "px-3 py-4" : "px-4 py-4"
      )}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {navigationItems.map((item) => {
                const isActive = pathname === item.path || 
                  (item.path !== "/dashboard" && pathname.startsWith(item.path));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild className={cn(isCollapsed && "w-full")}>
                          <Link
                            href={item.path}
                            className={cn(
                              "flex items-center rounded-xl transition-all duration-200 group relative",
                              isCollapsed ? "justify-center py-3 w-full" : "gap-3 px-3 py-3",
                              isActive
                                ? "bg-primary/10 dark:bg-primary/15 text-primary font-semibold"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-gray-100"
                            )}
                          >
                            {isActive && !isCollapsed && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-primary rounded-r-full" />
                            )}
                            <item.icon className={cn(
                              "h-5 w-5 transition-all duration-200 flex-shrink-0",
                              isActive ? "text-primary" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                            )} />
                            {!isCollapsed && <span className="text-sm">{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn(
        "pb-4 mt-auto border-t border-gray-100 dark:border-gray-900 pt-4 transition-all duration-300",
        isCollapsed ? "px-3" : "px-4"
      )}>
        <div className={cn(
          "space-y-4",
          isCollapsed && "flex flex-col items-center w-full"
        )}>
          {showUpgradeCTA && (
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/50 mb-4">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/25">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current plan:</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {currentSubscription?.plan || (currentSubscription?.isActive ? "Starter" : "Free")}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {upgradeMessage}
                </p>
                <Button 
                  size="sm" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200" 
                  asChild
                >
                  <Link href={upgradeLink} className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" />
                    {upgradeLabel}
                  </Link>
                </Button>
              </div>
            </div>
          )}
          
          {/* Theme Toggle */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "w-10 h-10 p-0 rounded-xl transition-all duration-200",
                      theme === "light"
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    )}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Light Mode</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "w-10 h-10 p-0 rounded-xl transition-all duration-200",
                      theme === "dark"
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    )}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Dark Mode</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex-1 rounded-xl transition-all duration-200",
                  theme === "light"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex-1 rounded-xl transition-all duration-200",
                  theme === "dark"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
            </div>
          )}

          <NavUser user={user} isCollapsed={isCollapsed} />
        </div>
      </SidebarFooter>
    </Sidebar>
    </TooltipProvider>
  );
}

export default AppSidebar;
