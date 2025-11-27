"use client";
import { useCallback, useEffect, useState } from "react";
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
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { CREDIT_EVENT_NAME } from "@/lib/credit-events";

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
  const { authFetch } = useAuthFetch();
  const [subscriptionState, setSubscriptionState] = useState<Subscription>(subscription);

  useEffect(() => {
    setSubscriptionState(subscription);
  }, [subscription]);

  const refreshSubscription = useCallback(async () => {
    try {
      const response = await authFetch("/api/user/subscription");
      if (!response.ok) return;
      const data = await response.json();

      setSubscriptionState((prev) => ({
        ...prev,
        ...data,
      }));
    } catch (error) {
      console.error("Failed to refresh subscription", error);
    }
  }, [authFetch]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleRefresh = () => {
      refreshSubscription();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener(CREDIT_EVENT_NAME, handleRefresh);
    const interval = setInterval(handleRefresh, 15000);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(CREDIT_EVENT_NAME, handleRefresh);
      clearInterval(interval);
    };
  }, [refreshSubscription]);

  const isCollapsed = state === "collapsed";
  const normalizedCredits =
    typeof subscriptionState.credits === "number" ? subscriptionState.credits : 0;
  const isTrialing = ["trialing", "ending"].includes(subscriptionState.trialStatus || "");
  const hasUsedTrial = Boolean(subscriptionState.trialCreditsAwarded);
  const showUpgradeCTA =
    !subscriptionState.isActive || normalizedCredits <= 0 || (isTrialing && hasUsedTrial);

  const upgradeMessage = !subscriptionState.isActive
    ? "Unlock premium features and generate high-converting thumbnails every month."
    : normalizedCredits <= 0 && isTrialing
      ? "You’ve used your trial credits. Upgrade to keep generating thumbnails."
      : "You’re out of credits. Upgrade to keep generating thumbnails.";

  const upgradeLink = !subscriptionState.isActive ? "/pricing" : "/dashboard/billing";

  const upgradeLabel = !subscriptionState.isActive
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
                      {subscriptionState.plan || (subscriptionState.isActive ? "Starter" : "Free")}
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
