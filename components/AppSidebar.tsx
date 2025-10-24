"use client";
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
} from "@/components/ui/sidebar";
import { useFreeCredits } from "@/hooks/use-free-credits";
import { cn } from "@/lib/utils";
import {
  Crown,
  History,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Sparkles,
  User,
  Video,
  Zap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type User = {
  name: string;
  email: string;
  avatar: string;
};
type Subscription = {
  credits: number;
  isActive: boolean;
  gotFreeCredits: boolean;
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
    icon: Image,
  },
  {
    title: "Add Project",
    path: "/dashboard/video-projects",
    icon: Video,
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
  const { isLoading, error, handleGetFreeCredits } = useFreeCredits();

  return (
    <Sidebar className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="block">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF0000] to-[#CC0000] rounded-lg flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
              ThumbMaker
            </h1>
            <Badge variant="secondary" className="uppercase text-[9px] px-1.5 py-0.5">
              AI
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium ml-10">
            YouTube Thumbnail Creator
          </p>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.path || 
                  (item.path !== "/dashboard" && pathname.startsWith(item.path));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                          isActive
                            ? "bg-primary text-primary-foreground font-medium shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md transition-colors",
                          isActive 
                            ? "bg-white/20 dark:bg-black/20" 
                            : "bg-transparent group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                        )}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-6 mt-auto border-t border-gray-200 dark:border-gray-800 pt-4">
        <div className="space-y-3">
        {!subscription.isActive && subscription.credits === 0 && (
            <div className="bg-gradient-to-br from-accent/50 to-muted dark:from-accent/30 dark:to-muted/50 p-4 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-primary/10 dark:bg-primary/20">
                  <Crown className="h-4 w-4 text-primary dark:text-primary" />
                </div>
                <span className="text-xs font-semibold text-foreground">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Unlimited thumbnails & premium features
              </p>
              <Button size="sm" className="w-full shadow-sm" asChild>
                <Link href="/pricing">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Upgrade Now
                </Link>
              </Button>
            </div>
          )}
          <NavUser user={user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
